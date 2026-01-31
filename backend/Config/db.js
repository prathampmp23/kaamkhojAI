const mongoose = require('mongoose');

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
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected');

        // Best-effort index migration for phone-first auth.
        await ensureAuthUserEmailIndex();
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;