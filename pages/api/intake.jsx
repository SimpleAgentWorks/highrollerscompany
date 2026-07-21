import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_FILE = join(process.cwd(), 'data', 'intake.json');

function readData() {
  if (!existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function notifyDiscord(submission) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL_INTAKE;
  if (!webhookUrl) return;

  const prefEmoji = submission.contactPreference === 'text' ? '💬' : submission.contactPreference === 'call' ? '📞' : '🌐';
  const prefLabel = submission.contactPreference === 'text' ? 'Text Me' : submission.contactPreference === 'call' ? 'Call Me' : 'Submit Online';

  const body = {
    content: `🎱 **New Lead — High Rollers Intake**\n\n**${prefEmoji} ${prefLabel}**\n**Name:** ${submission.name}\n**Phone:** ${submission.phone}\n**Email:** ${submission.email}\n\n📍 **Address:** ${submission.address}, ${submission.city}, ${submission.state} ${submission.zip}\n\n📝 **Job:** ${submission.jobDescription}\n\n⏰ Submitted: ${new Date(submission.submittedAt).toLocaleString('en-US', { timeZone: 'America/Chicago' })}`,
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.error('Discord notification failed:', e);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email, address, city, state, zip, jobDescription, contactPreference } = req.body;

    if (!name || !phone || !email || !address || !city || !state || !zip || !jobDescription) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const submission = {
      id: `lead-${Date.now()}`,
      name,
      phone,
      email,
      address,
      city,
      state,
      zip,
      jobDescription,
      contactPreference: contactPreference || 'web',
      submittedAt: new Date().toISOString(),
      status: 'new',
    };

    const data = readData();
    data.unshift(submission);
    writeData(data);

    // Fire-and-forget Discord notification
    notifyDiscord(submission).catch(console.error);

    return res.status(200).json({ success: true, id: submission.id });
  } catch (err) {
    console.error('Intake API error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
