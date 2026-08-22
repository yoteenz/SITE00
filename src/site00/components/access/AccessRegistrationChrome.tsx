/** Corner registration marks + subtle grid — access page only. */
export function AccessRegistrationChrome() {
  return (
    <div className="site00-access-chrome" aria-hidden="true">
      <span className="site00-access-chrome__corner site00-access-chrome__corner--tl" />
      <span className="site00-access-chrome__corner site00-access-chrome__corner--tr" />
      <span className="site00-access-chrome__corner site00-access-chrome__corner--bl" />
      <span className="site00-access-chrome__corner site00-access-chrome__corner--br" />
      <span className="site00-access-chrome__tick site00-access-chrome__tick--top" />
      <span className="site00-access-chrome__tick site00-access-chrome__tick--bottom" />
      <span className="site00-access-chrome__node site00-access-chrome__node--left" />
      <span className="site00-access-chrome__node site00-access-chrome__node--right" />
    </div>
  );
}
