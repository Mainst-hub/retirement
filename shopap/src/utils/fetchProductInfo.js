// Pulls product name, image, and price from a URL by reading Open Graph meta tags.
// Works on most e-commerce sites (Amazon, Nike, Saks, Target, Lowes, etc.)
export async function fetchProductInfo(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    const html = await res.text();
    return {
      name: extractMeta(html, ['og:title', 'twitter:title', 'title']) || '',
      image: extractMeta(html, ['og:image', 'twitter:image']) || '',
      price: extractPrice(html),
      store: extractStore(url),
    };
  } catch {
    return { name: '', image: '', price: '', store: extractStore(url) };
  }
}

function extractMeta(html, names) {
  for (const name of names) {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${name}["']`, 'i'),
      new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i'),
    ];
    if (name === 'title') {
      const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (m) return m[1].trim();
    }
    for (const re of patterns) {
      const m = html.match(re);
      if (m) return m[1].trim();
    }
  }
  return null;
}

function extractPrice(html) {
  const pricePatterns = [
    /property=["']product:price:amount["'][^>]+content=["']([0-9.,]+)["']/i,
    /content=["']([0-9.,]+)["'][^>]+property=["']product:price:amount["']/i,
    /property=["']og:price:amount["'][^>]+content=["']([0-9.,]+)["']/i,
    /"price"\s*:\s*"?([0-9.,]+)"?/i,
    /itemprop=["']price["'][^>]+content=["']([0-9.,]+)["']/i,
    /class=["'][^"']*price[^"']*["'][^>]*>\s*\$?\s*([0-9]+(?:\.[0-9]{2})?)/i,
  ];
  for (const re of pricePatterns) {
    const m = html.match(re);
    if (m) {
      const val = parseFloat(m[1].replace(/,/g, ''));
      if (val > 0 && val < 100000) return val.toFixed(2);
    }
  }
  return '';
}

function extractStore(url) {
  try {
    const host = new URL(url).hostname.replace('www.', '');
    const known = {
      'amazon.com': 'Amazon',
      'nike.com': 'Nike',
      'saksfifthavenue.com': 'Saks Fifth Avenue',
      'lowes.com': 'Lowes',
      'homedepot.com': 'Home Depot',
      'target.com': 'Target',
      'walmart.com': 'Walmart',
      'nordstrom.com': 'Nordstrom',
      'zappos.com': 'Zappos',
      'adidas.com': 'Adidas',
      'zara.com': 'Zara',
      'hm.com': 'H&M',
      'macys.com': "Macy's",
      'bestbuy.com': 'Best Buy',
      'apple.com': 'Apple',
    };
    return known[host] || host.split('.')[0].charAt(0).toUpperCase() + host.split('.')[0].slice(1);
  } catch {
    return 'Unknown Store';
  }
}
