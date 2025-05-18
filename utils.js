function createAgreement(
    country,
    language,
    languageName,
    publishDate,
    mainTitle,
    agreeText,
    nonAgreeText,
    mainText,
    subTitle,
    subText,
    type,
    version
) {
    return {
        country,
        language,
        language_name: languageName,
        publish_date: publishDate,
        texts: {
            '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            '@xsi:type': 'chunkedStoredAgreementText',
            main_title: { '#cdata': mainTitle },
            agree_text: { '#cdata': agreeText },
            non_agree_text: { '#cdata': nonAgreeText },
            main_text: { '@index': '1', '#cdata': mainText },
            sub_title: { '#cdata': subTitle },
            sub_text: { '@index': '1', '#cdata': subText }
        },
        type,
        version
    };
}

module.exports = { 
    createAgreement
};