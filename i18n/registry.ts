export async function getMessages(locale: string) {
  switch (locale) {
    case 'es':
      return (await import('./messages/es.json')).default
    case 'fr':
      return (await import('./messages/fr.json')).default
    case 'de':
      return (await import('./messages/de.json')).default
    case 'pt':
      return (await import('./messages/pt.json')).default
    case 'it':
      return (await import('./messages/it.json')).default
    case 'ja':
      return (await import('./messages/ja.json')).default
    case 'ko':
      return (await import('./messages/ko.json')).default
    case 'zh':
      return (await import('./messages/zh.json')).default
    case 'ar':
      return (await import('./messages/ar.json')).default
    case 'en':
    default:
      return (await import('./messages/en.json')).default
  }
}