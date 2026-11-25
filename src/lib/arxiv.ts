export interface AnchorLink {
  href: string;
  label: string;
  section: boolean;
}

export function arxivAnchor(paperId: string, text: string): AnchorLink {
  const flat = text.replace(/\s+/g, " ").trim();
  const section = flat.match(/§\s*(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (section) {
    const hash = `S${section[1]}${section[2] ? `.SS${section[2]}` : ""}${
      section[3] ? `.SSS${section[3]}` : ""
    }`;
    return { href: `https://arxiv.org/html/${paperId}#${hash}`, label: flat, section: true };
  }
  const chapter = flat.match(/第\s*(\d+)\s*节/);
  if (chapter) {
    return { href: `https://arxiv.org/html/${paperId}#S${chapter[1]}`, label: flat, section: true };
  }
  return { href: `https://arxiv.org/pdf/${paperId}`, label: `在 PDF 中检索 ${flat}`, section: false };
}