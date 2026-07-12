/**
 * Inline SVG icons used on the SAA 2025 login screen.
 * Inlined (rather than <img>) so brand colors render crisply and the
 * chevron can pick up `currentColor` for future theming.
 */

interface IconProps {
  className?: string;
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
    </svg>
  );
}

export function GoogleIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20.8245 12.2073C20.8245 11.5955 20.7748 10.9804 20.669 10.3785H12.1799V13.8443H17.0412C16.8395 14.962 16.1913 15.9508 15.2422 16.5792V18.8279H18.1425C19.8456 17.2604 20.8245 14.9455 20.8245 12.2073Z"
        fill="#4285F4"
      />
      <path
        d="M12.1799 21.0006C14.6073 21.0006 16.6543 20.2036 18.1458 18.8279L15.2455 16.5792C14.4386 17.1281 13.3969 17.439 12.1832 17.439C9.83527 17.439 7.84445 15.8549 7.13014 13.7252H4.1373V16.0434C5.66514 19.0826 8.77703 21.0006 12.1799 21.0006Z"
        fill="#34A853"
      />
      <path
        d="M7.12684 13.7252C6.74984 12.6074 6.74984 11.3971 7.12684 10.2793V7.96112H4.13731C2.86081 10.5042 2.8608 13.5003 4.1373 16.0434L7.12684 13.7252Z"
        fill="#FBBC04"
      />
      <path
        d="M12.1799 6.56224C13.463 6.5424 14.7032 7.02523 15.6324 7.9115L18.202 5.34196C16.5749 3.81413 14.4155 2.97415 12.1799 3.00061C8.77702 3.00061 5.66515 4.91868 4.13731 7.96112L7.12684 10.2793C7.83785 8.14631 9.83196 6.56224 12.1799 6.56224Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function FlagVnIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g clipPath="url(#clip0_login_flag_vn)">
        <rect width="20" height="15" transform="translate(2 5)" fill="#F7FCFF" />
        <path fillRule="evenodd" clipRule="evenodd" d="M2 5H22V20H2V5Z" fill="#F7FCFF" />
        <path fillRule="evenodd" clipRule="evenodd" d="M2 5V20H22V5H2Z" fill="#E31D1C" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.0396 14.988L8.82029 17.0349L9.9001 13.4517L7.60389 11.1107L10.7696 11.0415L12.1702 7.50412L13.4465 11.0882L16.6047 11.1434L14.2314 13.5273L15.3396 16.9361L12.0396 14.988Z"
          fill="#FFD221"
        />
      </g>
      <defs>
        <clipPath id="clip0_login_flag_vn">
          <rect width="20" height="15" fill="#F7FCFF" transform="translate(2 5)" />
        </clipPath>
      </defs>
    </svg>
  );
}

/**
 * NOTE: no EN flag asset was exported from the Figma frame (only the
 * default "VN" header state is present in the design). This UK-style flag
 * is a reasonable engineering stand-in for the EN dropdown option, kept
 * visually consistent (flat, 24x24) with the VN flag. Flag it for design
 * review if a brand-specific EN asset exists.
 */
export function FlagEnIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g clipPath="url(#clip0_login_flag_en)">
        <rect x="2" y="5" width="20" height="15" fill="#2E42A5" />
        <path d="M2 5L22 20M22 5L2 20" stroke="#F7FCFF" strokeWidth="2" />
        <path d="M2 5L22 20M22 5L2 20" stroke="#E31D1C" strokeWidth="1" />
        <path d="M12 5V20M2 12.5H22" stroke="#F7FCFF" strokeWidth="4" />
        <path d="M12 5V20M2 12.5H22" stroke="#E31D1C" strokeWidth="2" />
      </g>
      <defs>
        <clipPath id="clip0_login_flag_en">
          <rect x="2" y="5" width="20" height="15" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
