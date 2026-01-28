# 📤 How to Upload to GitHub

## Method 1: Using GitHub Web Interface (Easiest)

### Step 1: Create Repository
1. Go to **https://github.com** and sign up/login
2. Click the **"+"** button (top right) → **"New repository"**
3. Name it: `hockey-team-balancer`
4. Keep it **Public** (or Private if you prefer)
5. **Don't** check "Initialize with README" (we have our own files)
6. Click **"Create repository"**

### Step 2: Upload Files
1. On the repository page, click **"uploading an existing file"** link
2. **Drag and drop** all these files:
   - `package.json`
   - `vercel.json`
   - `index.js`
   - `index.css`
   - `BH_Team_Balancer.jsx`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `.gitignore`
   - `README.md`
   - `VERCEL_DEPLOYMENT.md`
   - `QUICK_START.md`

3. **Create `public` folder:**
   - After uploading, click **"Create new file"**
   - Type: `public/index.html`
   - Paste the contents of `index.html`
   - Click **"Commit new file"**

4. Add a commit message like "Initial upload" and click **"Commit changes"**

### Step 3: Done! ✅
Your files are now on GitHub and ready to deploy to Vercel!

---

## Method 2: Using Git CLI (For Developers)

### First Time Setup
```bash
# Install Git from git-scm.com if you haven't already

# Navigate to your project folder
cd /path/to/hockey-team-balancer

# Initialize Git
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit"

# Connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/hockey-team-balancer.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Future Updates
```bash
# Make changes to your files
# Then:
git add .
git commit -m "Your update message"
git push
```

---

## Method 3: GitHub Desktop (Visual Tool)

1. Download **GitHub Desktop** from desktop.github.com
2. Sign in with your GitHub account
3. Click **"File"** → **"Add Local Repository"**
4. Select your project folder
5. Click **"Publish repository"**
6. Name it `hockey-team-balancer` and click **"Publish"**

---

## What Files to Upload

Make sure you upload ALL of these:

```
✅ package.json
✅ vercel.json
✅ index.js
✅ index.css
✅ BH_Team_Balancer.jsx
✅ tailwind.config.js
✅ postcss.config.js
✅ .gitignore
✅ README.md
✅ public/index.html (in public folder!)
```

Optional but helpful:
- `VERCEL_DEPLOYMENT.md`
- `QUICK_START.md`

---

## Common Issues

**"Permission denied"?**
- Use GitHub Desktop or web interface instead

**Files missing?**
- Make sure you uploaded `public/index.html` in the `public/` folder
- Double-check all files are in the root directory (except index.html)

**Can't find repository?**
- Make sure it's Public (or you're logged into the right account)
- Repository name should be exactly: `hockey-team-balancer`

---

## Next Step: Deploy to Vercel!

Once files are on GitHub:
1. Go to **vercel.com**
2. Sign in with GitHub
3. Import your repository
4. Click Deploy
5. Get your live URL! 🎉

See `VERCEL_DEPLOYMENT.md` for detailed Vercel instructions.
