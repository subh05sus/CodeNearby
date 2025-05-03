# 🛠️ Troubleshooting Guide

Welcome to the **CodeNearby** troubleshooting guide! Here you'll find common issues and how to resolve them. If you're encountering a problem not listed here, feel free to reach out by opening an issue or asking in discussions.

---

## 🚨 Common Issues

### 1. **App Fails to Start (500 Internal Server Error)**
- **Possible Cause**: Incorrect `.env.local` file configuration or missing environment variables.
- **Solution**:
  - Ensure that your `.env.local` file is properly set up.
  - Verify that all required environment variables (like `GITHUB_ID`, `GITHUB_SECRET`, `MONGODB_URI`, etc.) are correctly filled in.
  - If you're using a cloud database, check if the credentials are correct.

### 2. **GitHub Authentication Error**
- **Possible Cause**: Invalid GitHub OAuth credentials.
- **Solution**:
  - Go to your [GitHub Developer Settings](https://github.com/settings/developers) and verify that the OAuth credentials (`GITHUB_ID` and `GITHUB_SECRET`) match those in your `.env.local` file.
  - Ensure the `NEXTAUTH_URL` in the `.env.local` file matches your local development or production URL.

### 3. **AI-Connect Not Returning Results**
- **Possible Cause**: Missing or invalid Meta: Llama 4 Maverick API key.
- **Solution**:
  - Ensure the `GOOGLE_GENERATIVE_AI_API_KEY` in your `.env.local` file is valid. You can get it from the [Google AI Studio](https://makersuite.google.com/app/apikey).
  - Check if the API key has sufficient permissions.

### 4. **Slow Performance / Caching Issues**
- **Possible Cause**: Redis cache misconfiguration or server performance issues.
- **Solution**:
  - Verify your Redis configuration in the `.env.local` file. Check if the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct.
  - Test Redis connection by running a simple Redis command in your terminal.
  - Ensure your Redis instance is up and running without any issues on Upstash.

### 5. **UI Layout/Design Issues (Broken Layout or Misalignment)**
- **Possible Cause**: Conflicting CSS, missing assets, or broken components.
- **Solution**:
  - Run `npm run dev` and open your app in the browser. Check for any console errors related to missing resources or components.
  - Clear your browser cache to ensure no outdated styles or assets are being used.
  - Inspect the UI components using the browser's developer tools to identify issues.

### 6. **Database Connection Errors**
- **Possible Cause**: Incorrect MongoDB URI or authentication failure.
- **Solution**:
  - Double-check the `MONGODB_URI` in the `.env.local` file. If using MongoDB Atlas, ensure that your IP address is whitelisted.
  - Test the database connection by running a simple MongoDB client command from your local environment.

---

## 🛠️ Additional Tips

- **Clear Node.js Cache**: If you face issues related to old dependencies or configuration, clear the npm cache by running:
  ```bash
  npm cache clean --force
  ```

- **Force Reinstall Dependencies**: Sometimes old or corrupt dependencies can cause issues. In this case, try forcing the installation of dependencies:
  ```bash
  npm install --force
  ```

- **Check Dependencies**: Ensure all project dependencies are installed and up to date. Run:
  ```bash
  npm install
  ```

- **Check Logs**: If you encounter issues that are not resolved by the above steps, check the logs in your terminal and browser's developer console for more details on the error.

---

## 🆘 Still Stuck?

If you're still having trouble, don’t hesitate to:
- Open an [issue](https://github.com/yourusername/codenearby/issues)
- Reach out via [Discussions](https://github.com/yourusername/codenearby/discussions)

---

> _We’re here to help! Thanks for being a part of the CodeNearby community._
```

### How to Add the Troubleshooting Guide:
1. Create a `TROUBLESHOOTING.md` file in the root of your repository.
2. Copy and paste the updated content into the file.
3. Commit and push it to your repository.

```bash
git add TROUBLESHOOTING.md
git commit -m "Add troubleshooting guide with force install instructions"
git push
```

This will help users resolve issues quickly by running `npm install --force` when facing dependency-related issues.
