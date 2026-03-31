// config.js — satoshi-note-web
// Set DEFAULT_SERVER to your satoshi-note backend URL (no trailing slash).
// Leave as empty string to require users to configure it via Settings.
window.SATOSHI_NOTE_DEFAULT_SERVER = 'https://satbase.co.za';

window.DEFAULT_DIAL_CODE = '27'; // Default country code for phone numbers, without the +. Example: '1' for USA, '44' for UK, '27' for South Africa.

window.DEFAULT_RANDOM_BYTES_LENGTH = 16; // Length in bytes for generated voucher secrets. Must be within the server's accepted range (16–32).
