const { Router } = require('express');
const xmlbuilder = require('xmlbuilder');
const { createAgreement } = require('../../../utils');
const timezones = require('../timezones.json');

const router = Router();

router.get('/agreements/:type/:region/:version', (req, res) => {
    const currentDate = new Date().getTime().toString();

    const xmlResponse = xmlbuilder.create({
        agreements: {
            agreement: [
                createAgreement('US', 'en', 'English', currentDate, 'Link3DS Services Agreement', 'Accept', 'Decline', 'Welcome to the Link3DS Beta !', 'Privacy Policy', 'Welcome to the Link3DS Beta !', 'NINTENDO-NETWORK-EULA', '0300'),
                createAgreement('US', 'en', 'Español', currentDate, 'Link3DS Services Agreement', 'Aceptar', 'Rechazar', '¡Bienvenido a la versión Beta de la Link3DS !', 'Política de Privacidad', '¡Bienvenido a la versión Beta de la Link3DS !', 'NINTENDO-NETWORK-EULA', '0300'),
                createAgreement('US', 'en', 'Français', currentDate, 'Link3DS Services Agreement', 'Accepter', 'Decliner', 'Bienvenue sur la Beta de Link3DS !', 'Politique de Confidentialité', 'Bienvenue sur la Beta de Link3DS !', 'NINTENDO-NETWORK-EULA', '0300'),
                createAgreement('US', 'en', 'Deutsch', currentDate, 'Link3DS Services Agreement', 'Akzeptieren', 'Abfall', 'Willkommen zur Beta des Link3DS !', 'Privacy Policy', 'Willkommen zur Beta des Link3DS !', 'NINTENDO-NETWORK-EULA', '0300')
            ]
        }
    }).end();

    res.set('Server', 'Nintendo 3DS (http)');
    res.set('X-Nintendo-Date', currentDate);
    res.set('Content-Type', 'text/xml').send(xmlResponse);
});

router.get('/time_zones/:country/:language', (req, res) => {
    const currentDate = new Date().getTime().toString();
    
    const { country, language } = req.params;
    const regionLanguages = timezones[country];
    const regionTimezones = regionLanguages && regionLanguages[language] ? regionLanguages[language] : Object.values(regionLanguages || {})[0];

    // Credits to Pretendo Network for the timezones.json (I'm too lazy to redo one bruh).
    const xmlResponse = xmlbuilder.create({
        timezones: {
            timezone: regionTimezones
        }
    }).end();

    res.set('Server', 'Nintendo 3DS (http)');
    res.set('X-Nintendo-Date', currentDate);
    res.set('Content-Type', 'text/xml').send(xmlResponse);
});

module.exports = router;