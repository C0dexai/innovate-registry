
// local_controller.js
//
// This is a STANDALONE Node.js script to demonstrate a more powerful
// Computer-Using Agent (CUA) that can control a browser using Playwright.
//
// IT IS NOT PART OF THE REACT WEB APPLICATION.
// It runs outside the browser's security sandbox and has more capabilities.
//
// --- HOW TO RUN ---
// 1. Install Node.js on your computer.
// 2. Install Playwright: `npm install playwright`
// 3. Run the script from your terminal: `node local_controller.js`
//

const { chromium } = require('playwright');
const fs = require('fs').promises;

// This is a MOCK function. In a real scenario, you would import and call
// your `generateCuaAction` function from `services/geminiService.ts` after
// adapting it for a Node.js environment.
async function getNextActionFromAI(task, imageBase64, actionHistory) {
    console.log(`[AI] Analyzing screen for task: "${task}"`);
    console.log(`[AI] Action history count: ${actionHistory.length}`);
    
    // --- MOCK AI LOGIC ---
    // This mock logic simulates the AI's response for demonstration purposes.
    // A real implementation would call the Gemini API here.
    if (actionHistory.length === 0) {
        return {
            thought: "First, I need to click the search bar to start.",
            action_type: 'click',
            coordinates: { x: 500, y: 380 } // Example coordinates for Bing search bar
        };
    }
    if (actionHistory.length === 1) {
        return {
            thought: "Now that the search bar is selected, I will type the search query.",
            action_type: 'type',
            text_to_type: 'latest news on the Gemini API'
        };
    }
     if (actionHistory.length === 2) {
        return {
            thought: "I've typed the query, now I will press Enter to search.",
            action_type: 'keypress',
            key: 'Enter'
        };
    }
    return {
        thought: "I have completed the search task.",
        action_type: 'done',
        summary: "Successfully searched for the latest news on the Gemini API."
    };
}


/**
 * Given a computer action from the AI, execute it using Playwright.
 * @param {import('playwright').Page} page The Playwright page object.
 * @param {object} action The action object from the AI.
 */
async function handleModelAction(page, action) {
  const actionType = action.action_type;
  console.log(`[ACTION] Executing: ${actionType.toUpperCase()}`);
  console.log(`[ACTION] AI Thought: "${action.thought}"`);

  try {
    switch (actionType) {
      case "click": {
        const { x, y } = action.coordinates;
        await page.mouse.click(x, y);
        break;
      }
      case "type": {
        const { text_to_type } = action;
        await page.keyboard.type(text_to_type, { delay: 50 }); // Add delay for realism
        break;
      }
      case "scroll": {
        const { x, y, scroll_direction } = action;
        await page.mouse.move(x, y);
        await page.mouse.wheel(0, scroll_direction === 'down' ? 100 : -100);
        break;
      }
      case "keypress": {
          const { key } = action;
          await page.keyboard.press(key);
          break;
      }
      case "wait": {
        await page.waitForTimeout(2000);
        break;
      }
      case "done": {
        console.log(`[ACTION] Task finished. Summary: ${action.summary}`);
        return true; // Signal to end the loop
      }
      default:
        console.log(`[ERROR] Unrecognized action: ${actionType}`);
    }
  } catch (e) {
    console.error(`[ERROR] Failed to handle action ${actionType}:`, e);
  }
  return false; // Signal to continue
}


async function main() {
  console.log("--- CUA Local Controller Initializing ---");
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("https://www.bing.com");

  const userTask = "Search bing.com for the latest news on the Gemini API";
  const actionHistory = [];
  let isDone = false;
  
  // The main control loop
  while (!isDone) {
    console.log("\n--- Starting New Cycle ---");
    await page.waitForTimeout(1000); // Wait for UI to settle

    // 1. Capture the state (screenshot)
    const screenshotBuffer = await page.screenshot();
    const screenshotBase64 = screenshotBuffer.toString('base64');
    
    // In a real app, you might save this for debugging:
    // await fs.writeFile(`debug_screenshot_${actionHistory.length}.png`, screenshotBuffer);

    // 2. Send state to the model to get the next action
    const action = await getNextActionFromAI(userTask, screenshotBase64, actionHistory);
    actionHistory.push(action);

    // 3. Execute the action in the environment
    isDone = await handleModelAction(page, action);
  }

  console.log("\n--- CUA Local Controller Finished ---");
  await browser.close();
}

main().catch(console.error);
