const crypto = require('crypto');
/**
 * @author Pretendo Network Team
 * @param {string} password 
 * @param {number} pid 
 * @returns {string} hashed password
 */
function nintendoPasswordHash(password, pid) {
	const pidBuffer = Buffer.alloc(4);
	pidBuffer.writeUInt32LE(pid);
	const unpacked = Buffer.concat([
		pidBuffer,
		Buffer.from('\x02\x65\x43\x46'),
		Buffer.from(password)
	]);
	const hashed = crypto.createHash('sha256').update(unpacked).digest().toString('hex');
	return hashed;
}

async function generateToken(key, options) {
	let dataBuffer = Buffer.alloc(1 + 1 + 4 + 8);
	dataBuffer.writeUInt8(options.system_type, 0x0);
	dataBuffer.writeUInt8(options.token_type, 0x1);
	dataBuffer.writeUInt32LE(options.pid, 0x2);
	dataBuffer.writeBigUInt64LE(options.expire_time, 0x6);
	if ((options.token_type !== 0x1 && options.token_type !== 0x2) || options.system_type === 0x3) {
		if (options.title_id === undefined || options.access_level === undefined) {
			return null;
		}
		dataBuffer = Buffer.concat([
			dataBuffer,
			Buffer.alloc(8 + 1)
		]);
		dataBuffer.writeBigUInt64LE(options.title_id, 0xE);
		dataBuffer.writeInt8(options.access_level, 0x16);
	}
	const iv = Buffer.alloc(16);
	const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
	const encrypted = Buffer.concat([
		cipher.update(dataBuffer),
		cipher.final()
	]);
	let final = encrypted;
	if ((options.token_type !== 0x1 && options.token_type !== 0x2) || options.system_type === 0x3) {
		const checksum = crc32(dataBuffer);
		final = Buffer.concat([
			checksum,
			final
		]);
	}
	return final;
}

function decryptToken(token, key) {
	let encryptedBody;
	let expectedChecksum = 0;
	if (token.length === 16) {
		encryptedBody = token;
	} else {
		expectedChecksum = token.readUint32BE();
		encryptedBody = token.subarray(4);
	}
	if (!key) {
		key = process.env.AES_KEY;
	}
	const iv = Buffer.alloc(16);
	const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
	const decrypted = Buffer.concat([
		decipher.update(encryptedBody),
		decipher.final()
	]);
	if (expectedChecksum && (expectedChecksum !== crc.crc32(decrypted))) {
		throw new Error('Checksum did not match. Failed decrypt. Are you using the right key?');
	}
	return decrypted;
}

function unpackToken(token) {
	const unpacked = {
		system_type: token.readUInt8(0x0),
		token_type: token.readUInt8(0x1),
		pid: token.readUInt32LE(0x2),
		expire_time: token.readBigUInt64LE(0x6)
	};
	if (unpacked.token_type !== 0x1 && unpacked.token_type !== 0x2) {
		unpacked.title_id = token.readBigUInt64LE(0xE);
		unpacked.access_level = token.readInt8(0x16);
	}
	return unpacked;
}

module.exports = {
    nintendoPasswordHash,
	generateToken,
	decryptToken,
	unpackToken
};