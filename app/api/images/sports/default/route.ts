export async function GET() {
  try {
    // Return a simple SVG placeholder for default sports image
    const svg = `
      <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="16" fill="#6b7280">
          Sports Event
        </text>
      </svg>
    `;

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400", // Cache for 1 day
      },
    });
  } catch (error) {
    // Return a simple gray rectangle as fallback
    const fallbackSvg = `
      <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
      </svg>
    `;

    return new Response(fallbackSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  }
}
