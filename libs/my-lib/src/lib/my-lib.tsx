import React from 'react';

import styled from 'styled-components';

/* eslint-disable-next-line */
export interface MyLibProps {}

const StyledMyLib = styled.div`
  color: pink;
`;

export const MyLib = (props: MyLibProps) => {
  return (
    <StyledMyLib>
      <h1>Welcome to my-lib!</h1>
    </StyledMyLib>
  );
};

export default MyLib;
