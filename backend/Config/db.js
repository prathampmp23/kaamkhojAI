const mongoose = require('mongoose');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let connectInFlight = null;
let reconnectHooked = false;

const ensureAuthUserEmailIndex = async () => {
    // Legacy issue: a non-sparse unique index on `email` treats missing values as null,
    // causing E11000 duplicate key errors for phone-only registrations.
    const collection = mongoose.connection.collection('authusers');

    let indexes = [];
    try {
        indexes = await collection.indexes();
    } catch (e) {
        console.warn('Could not list authusers indexes:', e.message);
        return;
    }

    const emailIndex = indexes.find((idx) => idx.name === 'email_1');
    const partialEmailIndex = indexes.find((idx) => idx.name === 'email_unique_if_present');

    // Drop legacy email_1 index if it is not sparse/partial.
    if (emailIndex && !emailIndex.sparse && !emailIndex.partialFilterExpression) {
        try {
            await collection.dropIndex('email_1');
            console.log('Dropped legacy authusers email_1 index');
        } catch (e) {
            console.warn('Could not drop legacy authusers email_1 index:', e.message);
        }
    }

    // Ensure partial unique index exists (only indexes real string emails)
    if (!partialEmailIndex) {
        try {
            await collection.createIndex(
                { email: 1 },
                {
                    unique: true,
                    name: 'email_unique_if_present',
                    partialFilterExpression: { email: { $type: 'string' } },
                }
            );
            console.log('Created authusers email_unique_if_present index');
        } catch (e) {
            console.warn('Could not create authusers email_unique_if_present index:', e.message);
        }
    }
};

const connectDB = async () => {
    if (connectInFlight) return connectInFlight;

    const uri = process.env.MONGO_URI;
    if (!uri) {
        throw new Error('MONGO_URI is missing. Please set it in backend/.env');
    }

    const envMaxRetries = Number.parseInt(process.env.MONGO_CONNECT_RETRIES || '', 10);
    const maxRetries = Number.isFinite(envMaxRetries)
        ? Math.max(0, envMaxRetries)
        : (process.env.NODE_ENV === 'production' ? 10 : 0); // 0 = infinite

    const envBaseDelay = Number.parseInt(process.env.MONGO_CONNECT_RETRY_DELAY_MS || '', 10);
    const baseDelayMs = Number.isFinite(envBaseDelay) ? Math.max(250, envBaseDelay) : 1000;
    const maxDelayMs = 30000;

    connectInFlight = (async () => {
        let attempt = 0;
        while (true) {
            attempt += 1;
            try {
                await mongoose.connect(uri, {
                    serverSelectionTimeoutMS: 7000,
                    socketTimeoutMS: 45000,
                });
                console.log('MongoDB connected');

                // Best-effort index migration for phone-first auth.
                await ensureAuthUserEmailIndex();

                if (!reconnectHooked) {
                    reconnectHooked = true;
                    mongoose.connection.on('disconnected', () => {
                        console.warn('MongoDB disconnected. Reconnecting...');
                        // Fire-and-forget; guarded by connectInFlight.
                        connectDB().catch((e) => {
                            console.error('MongoDB reconnect failed:', e.message);
                        });
                    });
                }

                return;
            } catch (err) {
                const msg = err?.message || String(err);
                console.error(`MongoDB connection error (attempt ${attempt}${maxRetries ? `/${maxRetries}` : ''}):`, msg);

                if (maxRetries && attempt >= maxRetries) {
                    throw err;
                }

                const delay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, Math.min(6, attempt - 1)));
                await sleep(delay);
            }
        }
    })().finally(() => {
        // Allow future reconnect attempts if we ever get disconnected.
        connectInFlight = null;
    });

    return connectInFlight;
};

module.exports = connectDB;