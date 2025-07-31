# 🚀 Claude API Setup Guide

Follow these steps to set up your Claude API key for AI-powered job parsing.

## 📋 Prerequisites

1. **Anthropic Account**: You need an account at [Anthropic Console](https://console.anthropic.com/)
2. **API Credits**: Claude API requires credits (you get free credits when you sign up)

## 🔑 Step 1: Get Your Claude API Key

1. **Go to Anthropic Console**
   - Visit: https://console.anthropic.com/
   - Sign up or log in to your account

2. **Create API Key**
   - Click on "API Keys" in the left sidebar
   - Click "Create Key"
   - Give it a name (e.g., "JobNest AI Parser")
   - Copy the API key (it starts with `sk-ant-`)

3. **Save Your Key**
   - Store it securely - you won't be able to see it again
   - If you lose it, you'll need to create a new one

## ⚙️ Step 2: Configure Environment Variable

1. **Open the .env file**
   ```bash
   cd client
   code .env  # or use your preferred editor
   ```

2. **Replace the placeholder**
   ```bash
   # Change this line:
   VITE_CLAUDE_API_KEY=your-claude-api-key-here
   
   # To this (with your actual key):
   VITE_CLAUDE_API_KEY=sk-ant-api03-...
   ```

3. **Save the file**

## 🧪 Step 3: Test Your Setup

1. **Run the test script**
   ```bash
   cd ..  # Go back to project root
   node test_claude_setup.js
   ```

2. **Expected output if successful:**
   ```
   🧪 Testing Claude API Setup...
   
   📝 Testing with sample job description...
   ✅ Claude API is working correctly!
   📊 Extracted data: { ... }
   📄 Cover letter generated: Yes
   📋 Tailored resume generated: Yes
   ```

3. **If you see errors:**
   - Check that your API key is correct
   - Verify you have sufficient credits
   - Make sure the .env file is in the `client` directory

## 🔄 Step 4: Restart Your Application

1. **Stop the development server** (Ctrl+C)

2. **Restart the client**
   ```bash
   cd client
   npm run dev
   ```

3. **Test in the browser**
   - Go to http://localhost:5173
   - Try adding a job with the "🤖 AI Parse & Generate" button

## 🎯 Step 5: Use AI Features

1. **Set up your global resume**
   - Click "Manage Resume" in the header
   - Fill in your resume details
   - Save it

2. **Test AI parsing**
   - Click "Add Job"
   - Paste a job description
   - Click "🤖 AI Parse & Generate"
   - Watch the magic happen! ✨

## 🔧 Troubleshooting

### ❌ "API key not configured" error
- Check that `VITE_CLAUDE_API_KEY` is set in `client/.env`
- Make sure the key starts with `sk-ant-`
- Restart your development server

### ❌ "API call failed" error
- Verify your API key is valid
- Check your Anthropic account for credits
- Try the test script: `node test_claude_setup.js`

### ❌ "Rate limit exceeded" error
- You've hit your API usage limits
- Check your Anthropic account for usage
- Wait a bit and try again

### ❌ Site crashes when using AI features
- Check the browser console for errors
- Make sure all imports are working
- Try restarting the development server

## 💰 Cost Information

- **Free Tier**: Anthropic provides free credits when you sign up
- **Pricing**: After free credits, Claude API costs ~$0.15 per 1M input tokens
- **Typical Usage**: Each job parsing uses ~2-5K tokens (~$0.0003-0.0008 per job)

## 🆘 Need Help?

1. **Check the console** for detailed error messages
2. **Verify your API key** format and validity
3. **Test with the script** to isolate issues
4. **Check Anthropic status** at https://status.anthropic.com/

---

**🎉 You're all set!** Once configured, you'll have access to:
- 🤖 Intelligent job description parsing
- 📄 AI-generated cover letters
- 📋 Tailored resume creation
- 🎯 Much more accurate field extraction 