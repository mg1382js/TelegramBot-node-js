const TelegramBot = require('node-telegram-bot-api');
const i18n = require('i18n');
const mongoose = require('mongoose');
const { Pool } = require('pg');
const mysql = require('mysql2');
const { NlpManager } = require('node-nlp');
const axios = require('axios');
const Redis = require('ioredis');
const OpenAI = require('openai');
require('dotenv').config(); // برای بارگذاری متغیرهای محیطی

class UltimateTelegramBot {
    constructor(token, options = {}) {
        this.bot = new TelegramBot(token, { polling: true });
        this.options = options;
        this.dataStore = {}; // ذخیره‌سازی داده‌ها
        this.userStore = {}; // مدیریت کاربران
        this.sessions = {}; // مدیریت جلسات کاربری
        this.language = options.language || 'en';
        this.manager = new NlpManager({ languages: [this.language] }); // برای NLP
        this.cache = options.cache ? new Redis(options.cache) : null;
        this.database = null;

        // پیکربندی OpenAI
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY // توکن OpenAI
        });

        this.setupBasicCommands();
        this.configureI18n(options.languages || [this.language]);
        this.initializeNlp();
    }

    // پیکربندی چندزبانه
    configureI18n(supportedLanguages) {
        i18n.configure({
            locales: supportedLanguages,
            directory: __dirname + '/locales',
            defaultLocale: this.language,
            objectNotation: true,
            register: global
        });
        i18n.setLocale(this.language);
    }

    setLanguage(language) {
        this.language = language;
        i18n.setLocale(language);
    }

    // مدیریت جلسات کاربری
    startSession(userId, initialData = {}) {
        this.sessions[userId] = initialData;
    }

    updateSession(userId, data) {
        if (this.sessions[userId]) {
            this.sessions[userId] = { ...this.sessions[userId], ...data };
        }
    }

    endSession(userId) {
        delete this.sessions[userId];
    }

    getSession(userId) {
        return this.sessions[userId] || null;
    }

    // اتصال به پایگاه داده
    connectToMongoDB(uri) {
        mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        this.database = mongoose;
    }

    connectToPostgreSQL(config) {
        const pool = new Pool(config);
        this.database = pool;
    }

    connectToMySQL(config) {
        const connection = mysql.createConnection(config);
        this.database = connection;
    }

    // پشتیبانی از Webhook
    setWebhook(url) {
        this.bot.setWebHook(url);
    }

    // سیستم مدیریت پرداخت‌ها
    processPayment(amount, currency, description, callback) {
        // یکپارچگی با سیستم‌های پرداخت مانند Stripe یا PayPal
    }

    // مدیریت کشینگ
    setCache(cache) {
        this.cache = cache ? new Redis(cache) : null;
    }

    cacheData(key, value, ttl) {
        if (this.cache) {
            this.cache.set(key, value, 'EX', ttl);
        }
    }

    getCachedData(key) {
        if (this.cache) {
            return this.cache.get(key);
        }
        return null;
    }

    // مدیریت خطاها
    onError(callback) {
        this.bot.on('polling_error', callback);
    }

    // تحلیل‌های پیشرفته
    logAnalytics(event, data) {
        // یکپارچگی با سیستم‌های تحلیل مانند Google Analytics و Mixpanel
    }

    // فرمان‌های پیش‌فرض و شخصی‌سازی
    setupBasicCommands() {
        this.onCommand('start', (bot, chatId) => {
            bot.sendMessage(chatId, __('welcome_message'));
        });

        this.onCommand('help', (bot, chatId) => {
            bot.sendMessage(chatId, __('help_message'));
        });
    }

    // پردازش NLP
    async initializeNlp() {
        this.manager.addDocument(this.language, 'hello', 'greetings.hello');
        this.manager.addDocument(this.language, 'how are you', 'greetings.howareyou');
        this.manager.addAnswer(this.language, 'greetings.hello', __('hello_response'));
        this.manager.addAnswer(this.language, 'greetings.howareyou', __('how_are_you_response'));
        await this.manager.train();
        this.manager.save();
    }

    async processNlp(chatId, text) {
        const response = await this.manager.process(this.language, text);
        if (response.intent !== 'None') {
            this.sendMessage(chatId, response.answer);
        } else {
            this.sendMessage(chatId, __('unknown_command_response'));
        }
    }

    // پردازش درخواست‌های ChatGPT
    async processChatGpt(chatId, text) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: text }]
            });

            const responseText = completion.choices[0].message.content;
            this.sendMessage(chatId, responseText);
        } catch (error) {
            console.error('Error processing ChatGPT request:', error);
            this.sendMessage(chatId, __('error_response'));
        }
    }

    onCommand(command, responseCallback) {
        this.bot.onText(new RegExp(`/${command}`), (msg, match) => {
            const chatId = msg.chat.id;
            responseCallback(this.bot, chatId, msg, match);
        });
    }

    onEvent(event, responseCallback) {
        this.bot.on(event, (data) => {
            responseCallback(this.bot, data);
        });
    }

    onMessage(callback) {
        this.bot.on('message', (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;

            // پردازش NLP
            this.processNlp(chatId, text);

            // پردازش درخواست‌های ChatGPT
            this.processChatGpt(chatId, text);

            callback(this.bot, chatId, msg);
        });
    }

    sendMessage(chatId, text, options = {}) {
        return this.bot.sendMessage(chatId, text, options);
    }

    // مدیریت زمان‌بندی پیام‌ها
    scheduleMessage(chatId, text, date) {
        const delay = date.getTime() - new Date().getTime();
        if (delay > 0) {
            setTimeout(() => {
                this.sendMessage(chatId, text);
            }, delay);
        }
    }

    // مدیریت پیام‌ها و فایل‌ها
    sendPhoto(chatId, photoUrl, options = {}) {
        return this.bot.sendPhoto(chatId, photoUrl, options);
    }

    sendDocument(chatId, documentUrl, options = {}) {
        return this.bot.sendDocument(chatId, documentUrl, options);
    }

    // مدیریت کلیدها
    setKeyboard(chatId, keyboard) {
        const opts = {
            reply_markup: {
                keyboard: keyboard,
                resize_keyboard: true
            }
        };
        this.sendMessage(chatId, __('choose_option'), opts);
    }

    // ذخیره و بازیابی داده‌ها
    saveData(key, value) {
        this.dataStore[key] = value;
    }

    getData(key) {
        return this.dataStore[key];
    }

    // درخواست اطلاعات از API خارجی
    callExternalAPI(apiUrl, callback) {
        axios.get(apiUrl)
            .then(response => callback(response.data))
            .catch(error => console.error('API request failed', error));
    }

    // مدیریت رویدادهای گروه
    onEvent(event, responseCallback) {
        this.bot.on(event, (msg) => {
            responseCallback(this.bot, msg);
        });
    }
}

module.exports = UltimateTelegramBot;
