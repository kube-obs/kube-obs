import { css } from '@emotion/react';

export const globalStyes = css`
  @import url('https://fonts.googleapis.com/css2?family=Montserrat+Alternates:wght@500&display=swap');

  .logo {
    font-family: 'Montserrat Alternates', sans-serif;
    color: white;
    font-size: 1.5rem;
  }

  #__next,
  .guideBody {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;
