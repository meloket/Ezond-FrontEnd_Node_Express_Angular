module.exports = {
    system: {
        serverPort: process.env.PORT || 8007,
        url: process.env.URL || "https://app.ezond.com/",
        auth_url: process.env.API_URL || "https://networks.ezond.com/",
        db_salt: process.env.DB_SALT || "1123MSDNMA(SDJ*ASDBASKJDNAKSdasiodh9as8hdbausdh712gebadsn1",
        site_title: process.env.SITE_TITLE || "Ezond Application",
        mail_name: process.env.MAIL_NAME || "Ezond Marketting Application",
        mail_email: process.env.MAIL_EMAIL || "notifications@ezond.com",
        feedback_email: process.env.FEEDBACK_EMAIL || "stepan.stepasyuk@gmail.com",
        redis_url: process.env.REDIS_URL || false,
        sentry_dns: process.env.SENTRY_DSN || false,
        environment: process.env.ENVIRONMENT || 'production'
    },
    stripe: {
        public_key: process.env.STRIPE_PUBLIC_KEY || "pk_test_5RlyM7IrBDIQG3nBYAnhM4mY",
        secret_key: process.env.STRIPE_SECRET_KEY || "sk_test_gxR2Iaewy6omglvhqlWhckun"
    },
    google: {
        map_key: process.env.GOOGLE_MAP_KEY || "AIzaSyB2O18subSyz9Zy7fBaeRq-ZfNNecDcBfI"
    }
};
