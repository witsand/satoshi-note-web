# Satoshi Note — Self-Hosting Deployment Guide

This guide walks you through deploying **satoshi-note-web** on your own virtual machine using **Caddy** as the web server, with a custom domain from either **MyNymbox** or **GoDaddy**.

The app is a pure static site (HTML/CSS/JS). No build step is required. Caddy handles HTTPS automatically via Let's Encrypt.

---

## Prerequisites

Before you begin, have the following ready:

- An SSH key pair (you'll paste the public key when creating the VM)
- A domain name (purchased from MyNymbox or GoDaddy)
- The URL of your **satoshi-note backend server** (e.g. `https://satbase.co.za` or your own hosted backend)
- A terminal application (macOS Terminal, Windows Terminal with WSL, or any Linux shell)

---

## Part 1: Provision a Virtual Machine

### Option A: LunaNode

1. Go to [lunanode.com](https://lunanode.com) and log in (or create an account).
2. Click **Create VM** (or "Virtual Machine" in the left sidebar).
3. Choose these settings:
   - **Region:** pick whichever is geographically closest to your users
   - **Image:** Ubuntu 22.04 LTS
   - **Plan:** The smallest plan (1 vCPU / 512MB RAM) is sufficient for a static site
4. Under **SSH Keys**, paste your public key (contents of `~/.ssh/id_rsa.pub` or `~/.ssh/id_ed25519.pub`).
5. Give the VM a name (e.g. `satoshi-note`) and click **Create**.
6. Wait ~60 seconds for the VM to boot. Note the **public IPv4 address** shown in the VM list.

> **Watch out:** LunaNode VMs have a cloud-level firewall separate from the OS firewall. After creating the VM, go to **Firewall** in the panel and ensure ports **22, 80, and 443** are allowed inbound. Without this, Caddy cannot obtain a TLS certificate.

---

### Option B: MyNymbox

1. Log in to your MyNymbox account and navigate to **VPS** or **Virtual Servers**.
2. Click **Order / Deploy New VPS**.
3. Choose:
   - **Operating System:** Ubuntu 22.04 LTS
   - **Resources:** 1 vCPU / 1GB RAM minimum recommended
4. Set a **root password** or, preferably, add your SSH public key during setup.
5. Complete the order and wait for the provisioning email.
6. Note the **public IPv4 address** from your control panel.

> **Watch out:** MyNymbox may provision with a restrictive default firewall. Check their control panel for any "Firewall" or "Security Groups" section and ensure ports 22, 80, and 443 are open before proceeding.

---

## Part 2: Initial Server Setup

SSH into your new VM as root (replace `YOUR_SERVER_IP`):

```bash
ssh root@YOUR_SERVER_IP
```

### Update the system

```bash
apt update && apt upgrade -y
```

### Create a non-root user

Running everything as root is risky. Create a dedicated user:

```bash
adduser deploy
usermod -aG sudo deploy
```

Copy your SSH key to the new user so you can log in as them:

```bash
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

Log out and verify you can SSH in as `deploy`:

```bash
ssh deploy@YOUR_SERVER_IP
```

> **Watch out:** Don't close your root session until you've confirmed the `deploy` user can log in. If you lock yourself out, you'll need to use your provider's emergency console.

### Configure the OS firewall (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Confirm the rules:

```bash
sudo ufw status
```

Expected output:
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
```

> **Watch out:** UFW is the *OS-level* firewall. Your VPS provider may also have a *cloud-level* firewall. Both must allow ports 80 and 443 or Caddy will silently fail to renew TLS certificates.

---

## Part 3: Install Caddy

Caddy automatically obtains and renews TLS certificates. Install it from the official repository:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl

curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg

curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list

sudo apt update
sudo apt install caddy
```

Enable and start the Caddy service:

```bash
sudo systemctl enable caddy
sudo systemctl start caddy
```

Verify it's running:

```bash
sudo systemctl status caddy
```

You should see `active (running)`.

> **Watch out:** Caddy listens on ports 80 and 443 immediately after starting. If another service (like Apache or Nginx) is already running on those ports, Caddy will fail to start. Check with `sudo ss -tlnp | grep ':80\|:443'` and stop any conflicting service.

---

## Part 4: Deploy the App

### Create the web root directory

Ubuntu 22.04 does not create `/var/www` by default. Create it first:

```bash
sudo mkdir -p /var/www
```

### Clone the repository

```bash
sudo git clone https://github.com/YOUR_USERNAME/satoshi-note-web.git /var/www/satoshi-note-web
```

Replace `YOUR_USERNAME` with your actual GitHub username or use the correct remote URL.

> **Watch out:** Do not clone to `/home/ubuntu/satoshi-note-web` or any path inside a home directory. Caddy runs as the `caddy` system user and cannot traverse home directories (they are mode `750` by default), which will cause a 403 error on every request.

### Configure the backend server URL

The file `js/config.js` is **gitignored** and will not be present after cloning. You must create it manually every time you set up a new server:

```bash
sudo cp /var/www/satoshi-note-web/js/config.js.example \
        /var/www/satoshi-note-web/js/config.js
```

Edit it to point to your backend:

```bash
sudo nano /var/www/satoshi-note-web/js/config.js
```

Change the file to:

```javascript
// config.js — satoshi-note-web
window.SATOSHI_NOTE_DEFAULT_SERVER = 'https://satbase.co.za';
```

Save with `Ctrl+O`, `Enter`, then `Ctrl+X`.

> **Watch out:** If `config.js` is missing, the browser will show a `blocked:x-unknown-content-type` error or silently fail to load the app configuration. This is one of the most common setup mistakes because the file is gitignored and easy to forget.

### Set correct file ownership

Caddy runs as the `caddy` system user and needs read access to all files:

```bash
sudo chown -R caddy:caddy /var/www/satoshi-note-web
sudo find /var/www/satoshi-note-web -type d -exec chmod 755 {} \;
sudo find /var/www/satoshi-note-web -type f -exec chmod 644 {} \;
```

---

## Part 5: Configure Caddy

Open the Caddy configuration file:

```bash
sudo nano /etc/caddy/Caddyfile
```

Replace the entire contents with the following (substitute `yourdomain.com` with your actual domain):

```
www.yourdomain.com {
    redir https://yourdomain.com{uri}
}

yourdomain.com {
    root * /var/www/satoshi-note-web
    file_server

    # Match serve.json rewrite rules
    rewrite /redeem /redeem.html

    # Security headers
    header {
        X-Frame-Options DENY
        Referrer-Policy strict-origin-when-cross-origin
    }
}
```

> **Watch out:** Do **not** include `X-Content-Type-Options: nosniff` in the header block. This header instructs browsers to strictly enforce MIME types and will cause Caddy to block JavaScript files (`.js`) from loading, showing a `blocked:x-unknown-content-type` error in the browser. Leave it out.

Save the file, then reload Caddy to apply the config:

```bash
sudo systemctl reload caddy
```

Check for errors:

```bash
sudo journalctl -u caddy --no-pager -n 30
```

> **Watch out:** Caddy will immediately attempt to obtain a TLS certificate from Let's Encrypt when it sees a domain name. This requires:
> 1. Your domain's DNS A record must already point to this server's IP.
> 2. Port 80 must be reachable from the internet (for the ACME HTTP-01 challenge).
>
> If either condition isn't met, you'll see `certificate obtain error` in the logs. This is not permanent — fix the DNS or firewall, then run `sudo systemctl reload caddy` again.

---

## Part 6: Point Your Domain to the Server

You need your domain's **A record** to point to your VM's public IPv4 address.

### Option A: Domain purchased on MyNymbox

1. Log in to MyNymbox and go to **Domains** → select your domain.
2. Click **Manage DNS** or **DNS Records**.
3. Find the existing **A record** for `@` (the root domain). If one exists, edit it. If not, add a new one.
4. Set:
   - **Type:** A
   - **Name/Host:** `@` (represents the root domain)
   - **Value/Points to:** your VM's public IPv4 address
   - **TTL:** 300 (5 minutes — good for initial setup; increase to 3600 after confirmed working)
5. Add a second A record for `www`:
   - **Name/Host:** `www`
   - **Value:** same IP address
6. Save the changes.

---

### Option B: Domain purchased on GoDaddy

1. Log in to GoDaddy and click **My Products**.
2. Next to your domain, click **DNS** (or **Manage DNS**).
3. In the **DNS Records** table, find the **A** record row where the Name is `@`.
4. Click the pencil/edit icon on that row.
5. Set:
   - **Value:** your VM's public IPv4 address
   - **TTL:** 600 seconds (or "Custom" → 600)
6. Click **Save**.
7. Add or edit the `www` A record to point to the same IP.

> **Watch out — GoDaddy-specific:** GoDaddy pre-populates A records with their own "parked page" IP. Make sure you **overwrite** that value — do not add a second A record alongside it. Having two A records for `@` pointing to different IPs causes intermittent failures where roughly half of visitors land on the wrong server.

---

### DNS Propagation

After saving DNS changes, wait for propagation. This typically takes **5–30 minutes** with a low TTL, but can take up to 48 hours if the old TTL was set high.

Check propagation from your local machine:

```bash
nslookup yourdomain.com 8.8.8.8
```

You're ready to proceed once the IP returned matches your VM's IP.

> **Watch out:** Do NOT reload Caddy until DNS propagation is confirmed. If Caddy fails its TLS challenge, it enters an exponential backoff period and may not retry for several minutes. Confirm DNS first, then reload Caddy.

---

## Part 7: Verify Everything Works

### Check the file is served correctly

```bash
curl -I https://yourdomain.com/js/config.js
```

Expected response includes:
```
HTTP/2 200
content-type: application/javascript
```

If this returns 404, the file wasn't created (see Part 4). If it returns 403, file ownership is wrong — rerun the `chown` command from Part 4.

### Basic connectivity

```bash
curl -I https://yourdomain.com
```

Expected: `HTTP/2 200`

### Check the /redeem route

```bash
curl -I https://yourdomain.com/redeem
```

Should also return `HTTP/2 200`. If it returns 404, the rewrite rule in your Caddyfile is missing — re-check Part 5.

### Check the app in a browser

1. Open `https://yourdomain.com` in Chrome or Firefox.
2. Open DevTools → **Console** tab. There should be no red errors.
3. Open DevTools → **Application** → **Service Workers**. The service worker (`sw.js`) should be listed as "Activated and running".
4. On mobile, you should be prompted to "Add to Home Screen" (PWA install prompt).

---

## Common Problems and What to Watch For

### 403 error on the entire site

**Symptom:** Browser shows 403 Forbidden immediately after visiting the domain.

**Cause:** The app files are in a home directory (e.g. `/home/ubuntu/`) and Caddy cannot read them.

**Fix:** Move the files to `/var/www/`:
```bash
sudo mkdir -p /var/www
sudo mv /home/ubuntu/satoshi-note-web /var/www/satoshi-note-web
sudo chown -R caddy:caddy /var/www/satoshi-note-web
```
Update the `root` path in your Caddyfile and reload Caddy.

---

### `blocked:x-unknown-content-type` on JavaScript files

**Symptom:** Browser DevTools shows JS files blocked with `x-unknown-content-type` or `net::ERR_BLOCKED_BY_ORB`.

**Cause:** Either:
1. `X-Content-Type-Options: nosniff` is set in the Caddyfile — this enforces strict MIME types and can block JS files. Remove this header entirely.
2. `js/config.js` does not exist (gitignored, must be created manually) — the server returns a 404 which has no JS content-type.

**Fix:**
- Remove `X-Content-Type-Options nosniff` from the header block in your Caddyfile.
- Confirm `js/config.js` exists: `ls -la /var/www/satoshi-note-web/js/config.js`
- If missing, create it from the example file (see Part 4).

---

### TLS certificate not issued / HTTPS not working

**Symptom:** Browser shows "Connection not secure" or `curl` returns a certificate error.

**Causes and fixes:**
- DNS hasn't propagated yet → wait and re-check with `nslookup`
- Port 80 is blocked → check both UFW (`sudo ufw status`) and your cloud provider's firewall panel
- Domain name typo in Caddyfile → confirm spelling matches your domain exactly
- Check Caddy logs: `sudo journalctl -u caddy -f`

---

### `/redeem` returns 404

**Symptom:** The main page loads but redemption links show a 404 error.

**Fix:** Ensure this line exists inside your domain block in the Caddyfile:
```
rewrite /redeem /redeem.html
```
Then run `sudo systemctl reload caddy`.

---

### App loads but shows no data / CORS errors in console

**Symptom:** The page loads but voucher creation fails. DevTools console shows `Access-Control-Allow-Origin` errors.

**Cause:** `js/config.js` has the wrong backend URL, or the backend is unreachable.

**Fix:**
1. Check the config: `cat /var/www/satoshi-note-web/js/config.js`
2. Test the backend is reachable: `curl https://satbase.co.za/config`
3. Confirm the backend has CORS configured to allow your domain.

---

### Old version of the app still showing after an update

**Symptom:** You pulled new code but visitors still see the old version.

**Cause:** The Service Worker (`sw.js`) caches static assets aggressively.

**Fix:**
- In Chrome DevTools → Application → Service Workers → click **Unregister**, then hard-refresh (`Ctrl+Shift+R`).
- For all visitors, bump the `CACHE_NAME` version string in `sw.js` with each deployment.

---

### SSH locked out

**Symptom:** You changed firewall rules and can no longer SSH in.

**Fix:** Use your VPS provider's emergency console:
- **LunaNode:** VM detail page → **Console** button
- **MyNymbox:** Control panel → **VNC Console** or **KVM Console**

From there, fix your UFW rules:
```bash
sudo ufw allow OpenSSH
```

> **Prevention:** Always keep one existing SSH session open when changing firewall rules. Only close it after confirming you can open a second session.

---

### `config.js` missing after a `git pull`

**Symptom:** App reverts to requiring users to manually set the server URL.

**Cause:** `js/config.js` is gitignored and never tracked. Running `git clean -f` will delete it.

**Fix:** Recreate the file:
```bash
sudo cp /var/www/satoshi-note-web/js/config.js.example \
        /var/www/satoshi-note-web/js/config.js
sudo nano /var/www/satoshi-note-web/js/config.js
sudo chown caddy:caddy /var/www/satoshi-note-web/js/config.js
```

> **Prevention:** Keep a copy of your configured `config.js` content in a secure location so you can recreate it quickly.

---

### Wrong IP in DNS / site loads someone else's content

**Symptom:** Domain resolves but shows a different site.

**Fix:**
1. Run `nslookup yourdomain.com` and compare the IP to your VM's IP.
2. Log in to your DNS provider and delete any duplicate A records for `@`.
3. Ensure only one A record exists for `@`.

---

### Caddy fails to start after reboot

**Symptom:** After a server reboot, the site is unreachable.

**Cause:** Caddy service not enabled to start on boot.

**Fix:**
```bash
sudo systemctl enable caddy
sudo systemctl start caddy
```

---

## Updating the App

To pull the latest code to your server:

```bash
cd /var/www/satoshi-note-web
sudo git pull
sudo chown -R caddy:caddy /var/www/satoshi-note-web
```

No Caddy restart needed. Remember that the Service Worker caches assets on the client side — users may need to wait for the SW to update or clear their cache manually.

> **Watch out:** `git pull` will never restore `js/config.js` since it is gitignored. If it goes missing, recreate it as described in Part 4.

---

## Quick Reference

| Task | Command |
|---|---|
| SSH into server | `ssh deploy@YOUR_SERVER_IP` |
| Check Caddy status | `sudo systemctl status caddy` |
| View Caddy logs | `sudo journalctl -u caddy -f` |
| Reload Caddy config | `sudo systemctl reload caddy` |
| Edit Caddyfile | `sudo nano /etc/caddy/Caddyfile` |
| Edit app config | `sudo nano /var/www/satoshi-note-web/js/config.js` |
| Pull latest code | `cd /var/www/satoshi-note-web && sudo git pull` |
| Fix file ownership | `sudo chown -R caddy:caddy /var/www/satoshi-note-web` |
| Check open ports | `sudo ss -tlnp` |
| Check firewall rules | `sudo ufw status` |
| Check DNS propagation | `nslookup yourdomain.com 8.8.8.8` |
| Verify JS config loads | `curl -I https://yourdomain.com/js/config.js` |
