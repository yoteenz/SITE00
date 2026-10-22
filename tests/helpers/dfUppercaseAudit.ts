/**
 * Uppercase audit for DF board markup: static text is uppercase; machine values (`DfMachine`) and the
 * signature mark keep the client's case.
 */
const PRESERVED = [/<span class="df-machine[^"]*">[\s\S]*?<\/span>/g, /<span class="df-sigcard__script">[\s\S]*?<\/span>/g];

export function visibleText(html: string): string {
  let s = html.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<(style|script)[\s\S]*?<\/\1>/g, ' ');
  for (const re of PRESERVED) s = s.replace(re, ' ');
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Words in visible static text that contain lowercase letters. */
export function visibleLowercase(html: string): string[] {
  return visibleText(html).match(/\S*[a-z]\S*/g) ?? [];
}
