import { Page } from 'playwright';
import { log, randomDelay } from '../utils';
import { BotConfig } from '../types';

export async function handleGoogleMeet(botConfig: BotConfig, page: Page): Promise<void> {
  const leaveButton = `//button[@aria-label="Leave call"]`;

  if (!botConfig.meetingUrl) {
    log('Error: Meeting URL is required for Google Meet but is null.');
    return;
  }

  log('Joining Google Meet');
  try {
    await joinMeeting(page, botConfig.meetingUrl, botConfig.botName)
  } catch (error: any) {
    console.error(error.message)
    return
  }

  // Setup websocket connection and meeting admission concurrently
  log("Starting WebSocket connection while waiting for meeting admission");
  try {
    // Run both processes concurrently
    const [isAdmitted] = await Promise.all([
      // Wait for admission to the meeting
      waitForMeetingAdmission(page, leaveButton, botConfig.automaticLeave.waitingRoomTimeout)
        .catch(error => {
          log("Meeting admission failed: " + error.message);
          return false;
        }),
      
      // Prepare for recording (expose functions, etc.) while waiting for admission
      prepareForRecording(page)
    ]);

    if (!isAdmitted) {
      console.error("Bot was not admitted into the meeting");
      return;
    }

    log("Successfully admitted to the meeting, starting recording");
    // Pass platform from botConfig to startRecording
    await startRecording(page, botConfig);
  } catch (error: any) {
    console.error(error.message)
    return
  }
}

// New function to wait for meeting admission
const waitForMeetingAdmission = async (page: Page, leaveButton: string, timeout: number): Promise<boolean> => {
  try {
    await page.waitForSelector(leaveButton, { timeout });
    log("Successfully admitted to the meeting");
    return true;
  } catch {
    throw new Error("Bot was not admitted into the meeting within the timeout period");
  }
};

// Prepare for recording by exposing necessary functions
const prepareForRecording = async (page: Page): Promise<void> => {
  // Expose the logBot function to the browser context
  await page.exposeFunction('logBot', (msg: string) => {
    log(msg);
  });
};

const joinMeeting = async (page: Page, meetingUrl: string, botName: string) => {
  const enterNameField = 'input[type="text"][aria-label="Your name"]';
  const joinButton = '//button[.//span[text()="Ask to join"]]';
  const muteButton = '[aria-label*="Turn off microphone"]';
  const cameraOffButton = '[aria-label*="Turn off camera"]';

  await page.goto(meetingUrl, { waitUntil: "networkidle" });
  await page.bringToFront();

  // Add a longer, fixed wait after navigation for page elements to settle
  log("Waiting for page elements to settle after navigation...");
  await page.waitForTimeout(5000); // Wait 5 seconds

  // Enter name and join
  // Keep the random delay before interacting, but ensure page is settled first
  await page.waitForTimeout(randomDelay(1000)); 
  log("Attempting to find name input field...");
  // Increase timeout drastically
  await page.waitForSelector(enterNameField, { timeout: 120000 }); // 120 seconds
  log("Name input field found.");

  await page.waitForTimeout(randomDelay(1000));
  await page.fill(enterNameField, botName);

  // Mute mic and camera if available
  try {
    await page.waitForTimeout(randomDelay(500));
    await page.click(muteButton, { timeout: 200 });
    await page.waitForTimeout(200);
  } catch (e) {
    log("Microphone already muted or not found.");
  }
  try {
    await page.waitForTimeout(randomDelay(500));
    await page.click(cameraOffButton, { timeout: 200 });
    await page.waitForTimeout(200);
  } catch (e) {
    log("Camera already off or not found.");
  }

  await page.waitForSelector(joinButton, { timeout: 60000 });
  await page.click(joinButton);
  log(`${botName} joined the Meeting.`);
}

// Modified to have only the actual recording functionality
const startRecording = async (page: Page, botConfig: BotConfig) => {
  // Destructure needed fields from botConfig
  const { meetingUrl, token, connectionId, platform, nativeMeetingId } = botConfig; // nativeMeetingId is now in BotConfig type

  log("Starting actual recording with WebSocket connection");

  // Pass the necessary config fields into the page context
  // Add type assertion for the object passed to evaluate
  await page.evaluate(async (config: BotConfig) => {
    // Destructure inside evaluate with types if needed, or just use config.* directly
    const { meetingUrl, token, connectionId, platform, nativeMeetingId, wsUrl: configWsUrl } = config; // Added wsUrl

    const option = {
      language: null,
      task: "transcribe",
      modelSize: "medium",
      useVad: true,
    }

    await new Promise<void>((resolve, reject) => {
      try {
        (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: "Starting recording process." }));
        const mediaElements = Array.from(document.querySelectorAll("audio, video")).filter(
          (el: any) => !el.paused
        );
        if (mediaElements.length === 0) {
          (window as any).logBot(JSON.stringify({ type: "error", source: "vexa-bot", timestamp: new Date().toISOString(), message: "No active media elements found. Ensure the meeting media is playing." }));
          return reject(new Error("[BOT Error] No active media elements found. Ensure the meeting media is playing."));
        }
        
        // NEW: Create audio context and destination for mixing multiple streams
        (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: `Found ${mediaElements.length} active media elements.` }));
        const audioContext = new AudioContext();
        const destinationNode = audioContext.createMediaStreamDestination();
        let sourcesConnected = 0;

        // NEW: Connect all media elements to the destination node
        mediaElements.forEach((element: any, index: number) => {
          try {
            const elementStream = element.srcObject || (element.captureStream && element.captureStream()) || 
                                 (element.mozCaptureStream && element.mozCaptureStream());
            
            if (elementStream instanceof MediaStream && elementStream.getAudioTracks().length > 0) {
              const sourceNode = audioContext.createMediaStreamSource(elementStream);
              sourceNode.connect(destinationNode);
              sourcesConnected++;
              (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: `Connected audio stream from element ${index+1}/${mediaElements.length}.` }));
            }
          } catch (error: any) {
            (window as any).logBot(JSON.stringify({ type: "error", source: "vexa-bot", timestamp: new Date().toISOString(), message: `Could not connect element ${index+1}: ${error.message}` }));
          }
        });

        if (sourcesConnected === 0) {
          (window as any).logBot(JSON.stringify({ type: "error", source: "vexa-bot", timestamp: new Date().toISOString(), message: "Could not connect any audio streams. Check media permissions." }));
          return reject(new Error("[BOT Error] Could not connect any audio streams. Check media permissions."));
        }

        // Use the combined stream instead of a single element's stream
        const stream = destinationNode.stream;
        (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: `Successfully combined ${sourcesConnected} audio streams.` }));

        // Ensure meetingUrl is not null before using btoa
        // const uniquePart = connectionId || btoa(nativeMeetingId || meetingUrl || ''); // No longer needed for ws://whisperlive
        // const structuredId = `${platform}_${uniquePart}`; // No longer needed for ws://whisperlive

        // Use wsUrl from config, which includes connectionId as a query parameter
        const wsUrl = configWsUrl; 
        (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: `Attempting to connect WebSocket to: ${wsUrl}` }));
        
        let socket: WebSocket | null = null;
        // let isServerReady = false; // No longer waiting for "server ready" message from whisperlive
        let language = option.language; // This might be irrelevant now
        let retryCount = 0;
        const maxRetries = 5; // Keep retry logic for WebSocket connection itself
        const retryDelay = 2000;
        
        const setupWebSocket = () => {
          try {
            if (socket) {
              // Close previous socket if it exists
              try {
                socket.close();
              } catch (err) {
                // Ignore errors when closing
              }
            }
            
            socket = new WebSocket(wsUrl);
            socket.binaryType = 'arraybuffer'; // Ensure binary data is received as ArrayBuffer for Float32Array

            socket.onopen = function() {
              (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: "WebSocket connection opened." }));
              retryCount = 0;
              // No handshake payload needed for the new backend; connectionId in URL is sufficient.
            };

            socket.onmessage = (event) => {
              // The new backend WS server for audio intake will not send messages like transcripts back to the bot.
              // It only receives audio. So, this handler might not be strictly necessary unless the server sends status/error messages.
              (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: `Received message from WebSocket: ${event.data}` }));
            };

            socket.onerror = (event) => {
              (window as any).logBot(JSON.stringify({ type: "error", source: "vexa-bot", timestamp: new Date().toISOString(), message: `WebSocket error: ${JSON.stringify(event)}` }));
            };

            socket.onclose = (event) => {
              (window as any).logBot(JSON.stringify({
                type: "info",
                source: "vexa-bot",
                timestamp: new Date().toISOString(),
                message: `WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}, WasClean: ${event.wasClean}`
              }));
              
              // Retry logic
              if (!event.wasClean && retryCount < maxRetries) { // Only retry if not a clean close
                const exponentialDelay = retryDelay * Math.pow(2, retryCount);
                retryCount++;
                (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: `Attempting to reconnect WebSocket in ${exponentialDelay}ms. Retry ${retryCount}/${maxRetries}` }));
                
                setTimeout(() => {
                  (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: `Retrying WebSocket connection (${retryCount}/${maxRetries})...` }));
                  setupWebSocket();
                }, exponentialDelay);
              } else if (!event.wasClean) {
                (window as any).logBot(JSON.stringify({ type: "error", source: "vexa-bot", timestamp: new Date().toISOString(), message: "Maximum WebSocket reconnection attempts reached. Giving up." }));
                // Optionally, we could reject the promise here if required
              }
            };
          } catch (e: any) {
            (window as any).logBot(JSON.stringify({ type: "error", source: "vexa-bot", timestamp: new Date().toISOString(), message: `Error creating WebSocket: ${e.message}` }));
            if (retryCount < maxRetries) {
              const exponentialDelay = retryDelay * Math.pow(2, retryCount);
              retryCount++;
              (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: `Attempting to reconnect WebSocket in ${exponentialDelay}ms due to creation error. Retry ${retryCount}/${maxRetries}` }));
              
              setTimeout(() => {
                (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: `Retrying WebSocket connection (${retryCount}/${maxRetries})...` }));
                setupWebSocket();
              }, exponentialDelay);
            } else {
              return reject(new Error(`WebSocket creation failed after ${maxRetries} attempts: ${e.message}`));
            }
          }
        };
        
        setupWebSocket();

        const context = new AudioContext();
        const mediaStream = context.createMediaStreamSource(stream); 
        const recorder = context.createScriptProcessor(4096, 1, 1);

        recorder.onaudioprocess = async (event) => {
          if (!socket || socket.readyState !== WebSocket.OPEN) {
               return;
          }
          const inputData = event.inputBuffer.getChannelData(0);
          // Data is already Float32Array from getChannelData(0)
          // Resample to 16kHz (this logic was already present and seems correct for whisperlive, should be fine for Deepgram too if it expects 16kHz)
          const targetSampleRate = 16000;
          const sourceSampleRate = context.sampleRate;
          
          if (sourceSampleRate === targetSampleRate) {
            // No resampling needed, send directly
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(inputData.buffer); // Send ArrayBuffer
            }
          } else {
            // Resample
            const targetLength = Math.round(inputData.length * (targetSampleRate / sourceSampleRate));
            const resampledData = new Float32Array(targetLength);
            const springFactor = (inputData.length - 1) / (targetLength - 1);
            resampledData[0] = inputData[0];
            resampledData[targetLength - 1] = inputData[inputData.length - 1];
            for (let i = 1; i < targetLength - 1; i++) {
              const index = i * springFactor;
              const leftIndex = Math.floor(index);
              const rightIndex = Math.ceil(index);
              const fraction = index - leftIndex;
              resampledData[i] = inputData[leftIndex] + (inputData[rightIndex] - inputData[leftIndex]) * fraction;
            }
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(resampledData.buffer); // Send ArrayBuffer of resampled data
            }
          }
        };

        mediaStream.connect(recorder);
        recorder.connect(context.destination);
        
        (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: "Audio processing pipeline connected and sending data." }));

        const peopleButton = document.querySelector('button[aria-label^="People"]');
        if (!peopleButton) {
          (window as any).logBot(JSON.stringify({ type: "error", source: "vexa-bot", timestamp: new Date().toISOString(), message: "[BOT Inner Error] 'People' button not found. Update the selector." }));
          recorder.disconnect();
          return reject(new Error("[BOT Inner Error] 'People' button not found. Update the selector."));
        }
        (peopleButton as HTMLElement).click();

        let aloneTime = 0;
        const checkInterval = setInterval(() => {
          const peopleList = document.querySelector('[role="list"]');
          if (!peopleList) {
            (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: "Participant list not found; assuming meeting ended." }));
            clearInterval(checkInterval);
            recorder.disconnect();
            if (socket && socket.readyState === WebSocket.OPEN) socket.close(1000, "Meeting ended or participant list disappeared");
            resolve();
            return;
          }
          const count = peopleList.childElementCount;
          (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: `Participant count: ${count}` }));

          if (count <= 1) {
            aloneTime += 5;
            (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: `Bot appears alone for ${aloneTime} seconds...` }));
          } else {
            aloneTime = 0;
          }

          if (aloneTime >= 10 || count === 0) {
            (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: "Meeting ended or bot alone for too long. Stopping recorder..." }));
            clearInterval(checkInterval);
            recorder.disconnect();
            if (socket && socket.readyState === WebSocket.OPEN) socket.close(1000, "Meeting ended or bot alone too long");
            resolve();
          }
        }, 5000);

        window.addEventListener("beforeunload", () => {
          (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: "Page is unloading. Stopping recorder..." }));
          clearInterval(checkInterval);
          recorder.disconnect();
          if (socket && socket.readyState === WebSocket.OPEN) socket.close(1000, "Page unloading");
          resolve();
        });
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "hidden") {
            (window as any).logBot(JSON.stringify({ type: "info", source: "vexa-bot", timestamp: new Date().toISOString(), message: "Document is hidden. Stopping recorder..." }));
            clearInterval(checkInterval);
            recorder.disconnect();
            if (socket && socket.readyState === WebSocket.OPEN) socket.close(1000, "Document hidden");
            resolve();
          }
        });
      } catch (error: any) {
        (window as any).logBot(JSON.stringify({ type: "error", source: "vexa-bot", timestamp: new Date().toISOString(), message: `[BOT Error] ${error.message}`, details: error.stack }));
        return reject(new Error("[BOT Error] " + error.message));
      }
    });
  }, botConfig);
};

// Remove the compatibility shim 'recordMeeting' if no longer needed,
// otherwise, ensure it constructs a valid BotConfig object.
// Example if keeping:
/*
const recordMeeting = async (page: Page, meetingUrl: string, token: string, connectionId: string, platform: "google_meet" | "zoom" | "teams", wsUrl: string) => { // Added wsUrl
  await prepareForRecording(page);
  // Construct a minimal BotConfig - adjust defaults as needed
  const dummyConfig: BotConfig = {
      platform: platform,
      meetingUrl: meetingUrl,
      botName: "CompatibilityBot",
      token: token,
      connectionId: connectionId,
      nativeMeetingId: "", // Might need to derive this if possible
      wsUrl: wsUrl, // Added wsUrl
      automaticLeave: { waitingRoomTimeout: 300000, noOneJoinedTimeout: 300000, everyoneLeftTimeout: 300000 },
  };
  await startRecording(page, dummyConfig);
};
*/
