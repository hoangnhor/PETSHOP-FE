import React from "react";

const ICONS = {
  cart: [<circle key="c1" cx="9" cy="20" r="1.7" />, <circle key="c2" cx="17" cy="20" r="1.7" />, <path key="p1" d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H7" />, <path key="p2" d="M9 11h8" />],
  heart: [<path key="p1" d="M12 20s-7-4.4-9-8.5C1.5 8.2 3.5 5 7 5c2 0 3.2 1.1 5 3 1.8-1.9 3-3 5-3 3.5 0 5.5 3.2 4 6.5C19 15.6 12 20 12 20Z" />],
  user: [<circle key="c1" cx="12" cy="8" r="4" />, <path key="p1" d="M5 20c1.4-4 4-6 7-6s5.6 2 7 6" />],
  search: [<circle key="c1" cx="11" cy="11" r="7" />, <path key="p1" d="M20 20l-3.5-3.5" />],
  tag: [<path key="p1" d="M3 11V5a2 2 0 0 1 2-2h6l10 10-8 8L3 11Z" />, <circle key="c1" cx="8" cy="8" r="1.5" />],
  trash: [<path key="p1" d="M4 7h16" />, <path key="p2" d="M7 7v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7" />, <path key="p3" d="M10 4h4" />],
  edit: [<path key="p1" d="M4 20h4l11-11-4-4L4 16v4Z" />, <path key="p2" d="m13 7 4 4" />],
  check: [<path key="p1" d="m5 12 4 4 10-10" />],
  clock: [<circle key="c1" cx="12" cy="12" r="9" />, <path key="p1" d="M12 7v6l4 2" />],
  truck: [<path key="p1" d="M3 7h11v10H3z" />, <path key="p2" d="M14 10h4l3 3v4h-7" />, <circle key="c1" cx="7" cy="18" r="2" />, <circle key="c2" cx="18" cy="18" r="2" />],
  eye: [<path key="p1" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />, <circle key="c1" cx="12" cy="12" r="2.5" />],
  star: [<path key="p1" d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.9L12 3.5z" />],
  filter: [<path key="p1" d="M4 6h16" />, <path key="p2" d="M7 12h10" />, <path key="p3" d="M10 18h4" />],
};

const PetshopIcon = ({ name, size = 20, stroke = "currentColor", strokeWidth = 1.8, ...rest }) => {
  const nodes = ICONS[name] || ICONS.search;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {nodes}
    </svg>
  );
};

export default PetshopIcon;
