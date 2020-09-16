import styled, { css } from 'styled-components';

const Divider = styled.hr`
  ${props =>
    props.left &&
    css`
      margin-left: '0%';
    `}
`;

export default Divider;
