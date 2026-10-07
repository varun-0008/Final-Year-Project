// Service for Open Library API by Internet Archive

async function searchOpenLibrary(query, limit = 12) {
  if (!query || query.trim() === '') {
    return [];
  }

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query.trim())}&limit=${limit}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'LibraryManagementSystem/1.0 (academic project; contact@library.com)',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Open Library API responded with HTTP ${response.status}`);
  }

  const data = await response.json();
  const docs = data.docs || [];

  return docs.map(doc => {
    // Determine primary ISBN (prefer ISBN-13, then ISBN-10, or doc.isbn[0])
    let isbn = null;
    if (doc.isbn && doc.isbn.length > 0) {
      isbn = doc.isbn.find(i => i.length === 13) || doc.isbn[0];
    }

    // Determine author
    const author = doc.author_name ? doc.author_name.slice(0, 3).join(', ') : 'Unknown Author';

    // Determine primary genre / subject
    let genre = 'General';
    if (doc.subject && doc.subject.length > 0) {
      genre = doc.subject[0].slice(0, 50);
    }

    // Cover image URL
    let coverUrl = null;
    if (doc.cover_i) {
      coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
    }

    return {
      title: doc.title,
      author,
      isbn: isbn || `OL-${(doc.key || '').replace(/[^a-zA-Z0-9]/g, '')}`,
      published_year: doc.first_publish_year || null,
      genre,
      cover_url: coverUrl,
      open_library_key: doc.key,
      edition_count: doc.edition_count || 1,
    };
  });
}

async function lookupByISBN(isbn) {
  if (!isbn || isbn.trim() === '') {
    return null;
  }

  const cleanIsbn = isbn.trim().replace(/[^0-9X]/gi, '');
  const url = `https://openlibrary.org/isbn/${encodeURIComponent(cleanIsbn)}.json`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'LibraryManagementSystem/1.0 (academic project; contact@library.com)',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Open Library ISBN lookup failed with HTTP ${response.status}`);
  }

  const data = await response.json();

  let description = '';
  if (typeof data.description === 'string') {
    description = data.description;
  } else if (data.description && data.description.value) {
    description = data.description.value;
  }

  // Parse publish year
  let year = null;
  if (data.publish_date) {
    const match = data.publish_date.match(/\b(19\d\d|20\d\d)\b/);
    if (match) year = parseInt(match[1], 10);
  }

  // Cover URL
  let coverUrl = null;
  if (data.covers && data.covers.length > 0) {
    coverUrl = `https://covers.openlibrary.org/b/id/${data.covers[0]}-M.jpg`;
  }

  return {
    title: data.title,
    isbn: isbn.trim(),
    published_year: year,
    description: description.slice(0, 1000),
    cover_url: coverUrl,
  };
}

module.exports = {
  searchOpenLibrary,
  lookupByISBN,
};
