import PropTypes from 'prop-types';

export default function Image({src,...rest}) {
    src = src && src.includes('https://')
      ? src
      : 'https://backend-booking-two.vercel.app/'+src;
    return (
      <img {...rest} src={src} alt={''} />
    );
}

Image.propTypes = {
 src: PropTypes.string.isRequired,
};
