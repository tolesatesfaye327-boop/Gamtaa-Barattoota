# Fix: Permission Denied Error

## Problem
```
remote: Permission to tolesatesfaye327-boop/Gamtaa-Barattoota.git denied to TolesaTesfaye.
```

Git is using cached credentials for `TolesaTesfaye` but the repository belongs to `tolesatesfaye327-boop`.

## Solution: Clear Cached Credentials and Push with Correct Account

### Option 1: Use Credential Manager (Windows)

1. **Open Credential Manager:**
   - Press `Windows Key` + `R`
   - Type: `control /name Microsoft.CredentialManager`
   - Press Enter

2. **Remove GitHub Credentials:**
   - Click "Windows Credentials"
   - Find entries starting with `git:https://github.com`
   - Click each one → "Remove"

3. **Push Again:**
   ```cmd
   cd C:\Users\hp\Desktop\GBAABW
   git push gamtaa main
   ```

4. **When Prompted:**
   - Username: `tolesatesfaye327-boop`
   - Password: Your Personal Access Token for this account

### Option 2: Push with Username in URL

Force Git to ask for credentials by including username in the URL:

```cmd
cd C:\Users\hp\Desktop\GBAABW
git remote remove gamtaa
git remote add gamtaa https://tolesatesfaye327-boop@github.com/tolesatesfaye327-boop/Gamtaa-Barattoota.git
git push gamtaa main
```

When prompted for password, use your Personal Access Token.

### Option 3: Use GitHub CLI (Recommended)

1. **Install GitHub CLI:**
   - Download from: https://cli.github.com/
   - Or use winget: `winget install GitHub.cli`

2. **Authenticate:**
   ```cmd
   gh auth login
   ```
   - Select: GitHub.com
   - Select: HTTPS
   - Select: Login with a web browser
   - Follow the prompts and sign in as `tolesatesfaye327-boop`

3. **Push:**
   ```cmd
   cd C:\Users\hp\Desktop\GBAABW
   git push gamtaa main
   ```

### Option 4: Use GitHub Desktop (Easiest!)

This completely bypasses the credential issue:

1. **Download:** https://desktop.github.com/
2. **Install and open**
3. **Sign in as:** `tolesatesfaye327-boop`
4. **Add Repository:**
   - File → Add Local Repository
   - Choose: `C:\Users\hp\Desktop\GBAABW`
5. **Publish/Push:**
   - Repository → Repository Settings
   - Change Primary remote to: `https://github.com/tolesatesfaye327-boop/Gamtaa-Barattoota`
   - Click "Push origin"

### Option 5: Create Personal Access Token and Push

1. **Create Token for tolesatesfaye327-boop account:**
   - Sign in to GitHub as `tolesatesfaye327-boop`
   - Go to: https://github.com/settings/tokens
   - Generate new token (classic)
   - Name: `GBAABW Push`
   - Select: ✅ `repo` (full control)
   - Generate and **copy the token**

2. **Clear credentials and push:**
   ```cmd
   git credential-manager erase https://github.com
   git push gamtaa main
   ```

3. **When prompted:**
   - Username: `tolesatesfaye327-boop`
   - Password: [paste the token you just created]

## Verify Which Account Git is Using

```cmd
git config user.name
git config user.email
```

Current settings show:
- Name: Tolesa
- Email: tolesatesfaye273@gmail.com

This is just for commit authorship and is fine. The issue is with push authentication.

## Quick Test

After clearing credentials, test with:
```cmd
git ls-remote gamtaa
```

If it asks for credentials, that's good - provide the correct ones.

## Recommended Solution

**Use GitHub Desktop** - it's the easiest and most reliable way to handle multiple GitHub accounts.

---

**Next:** After successful push, verify at https://github.com/tolesatesfaye327-boop/Gamtaa-Barattoota
