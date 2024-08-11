
### **README - Español**

# UltimateTelegramBot

**UltimateTelegramBot** es una clase poderosa y altamente personalizable para crear bots de Telegram con Node.js. Esta clase ofrece un conjunto completo de características para gestionar, controlar y ampliar la funcionalidad de tus bots de Telegram.

## Características

- **Soporte multilingüe**: Soporte integrado para varios idiomas usando `i18n`.
- **Integración NLP**: Procesa los mensajes de los usuarios usando procesamiento de lenguaje natural con `node-nlp`.
- **Integración ChatGPT**: Interactúa con los usuarios usando ChatGPT para respuestas avanzadas.
- **Conectividad de base de datos**: Soporte para MongoDB, PostgreSQL y MySQL.
- **Caché**: Caché opcional con Redis para mejorar el rendimiento.
- **Soporte para Webhook**: Configuración sencilla de webhooks para tu bot.
- **Procesamiento de pagos**: Integración con sistemas de pago como Stripe o PayPal.
- **Programación de mensajes**: Programa mensajes para enviarlos en momentos específicos.
- **Manejo de errores**: Manejo personalizado de errores para una mejor depuración.
- **Analítica**: Integración con plataformas de analítica para rastrear interacciones con el bot.
- **Gestión de archivos**: Envía fotos y documentos.
- **Teclados personalizables**: Configura teclados personalizados para la interacción con los usuarios.
- **Llamadas a API externas**: Realiza solicitudes a APIs externas.

## Instalación

```bash
npm install node-telegram-bot-api i18n node-nlp axios ioredis openai mongoose pg mysql2 dotenv
```
## Uso
```javascript

const UltimateTelegramBot = require('./UltimateTelegramBot');

const bot = new UltimateTelegramBot('YOUR_TELEGRAM_BOT_TOKEN', {
  language: 'es',
  cache: { host: 'localhost', port: 6379 }
});

bot.onCommand('start', (botInstance, chatId) => {
  botInstance.sendMessage(chatId, '¡Bienvenido a tu bot!');
});

bot.onMessage((botInstance, chatId, msg) => {
  // Manejo de mensajes
});
```

## Configuración
Configura tu archivo .env con tu clave API de OpenAI:

makefile

OPENAI_API_KEY=your_openai_api_key

## Contribuciones
Creemos en el poder de la comunidad y la colaboración de código abierto. Por favor, comparte este paquete ampliamente para que pueda beneficiar a la mayor cantidad posible de desarrolladores. Únete a nosotros para mejorar este proyecto visitando nuestro repositorio de GitHub. ¡Construyamos juntos el mejor marco de bots de Telegram y hagámoslo una sensación global!

