import winston from 'winston';
 
export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: '/var/log/web-app/webapp.log' })
    // new winston.transports.File({ filename: './logs/logs.log' })

  ]
});
 
export default logger;