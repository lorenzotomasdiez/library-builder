import { render } from '@testing-library/react';
import Navbar from './navbar';

describe('Navbar test', () => {
  it('renders', () => {
    const { getByText } = render(<Navbar />);
    expect(getByText('Navbar')).toBeTruthy();
  });
});