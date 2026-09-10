import React from 'react';

interface PixoraLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export const PixoraLogo: React.FC<PixoraLogoProps> = ({
  size = 28,
  className = '',
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 150 140.4"
      width={size}
      height={size}
      className={className}
      fill="none"
      {...props}
    >
      <path fill="#C6C6C5" d="m75 122c-13 0-27.3 0.5-27.3 2.4s12.6 2.5 27.3 2.5 26.9-0.8 26.9-2.2c0-2-13.3-2.8-26.9-2.7z" />
      <polygon fill="#282727" points="67.4 54.1 67.4 58.6 40.5 75.5 13.5 58.6 13.5 54.1" />
      <polygon fill="#2D2D2D" points="40.5 36.6 13.5 54.1 40.4 71 67.4 54.1" />
      <polygon fill="#CC6321" points="101.5 30.8 101.5 35.3 74.9 52.5 48.2 35.3 48.2 30.8" />
      <polygon fill="#ED711B" points="74.9 13.9 48.2 30.8 74.8 47.7 101.5 30.8" />
      <polygon fill="#282727" points="82.2 54.1 82.2 58.6 109.2 75.5 136.4 58.6 136.4 54.1" />
      <polygon fill="#2C2C2C" points="109.2 36.9 82.2 54.1 109.2 70.9 136.4 54.1" />
      <polygon fill="#282727" points="48.2 76.9 48.2 81.3 75 98.3 101.5 81.3 101.5 76.9" />
      <polygon fill="#2D2D2D" points="74.9 60.2 48.2 76.9 74.9 93.5 101.5 76.9" />
    </svg>
  );
};
