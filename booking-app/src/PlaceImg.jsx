import PropTypes from 'prop-types';

export default function PlaceImg({place, index=0, className}) {
    if(!place.photos?.length){
        return '';
    }
    if(!className){
        className = 'object-cover';
    }

    return (
        <img className={className} src={'http://localhost:4000/'+place.photos[index]} alt="" />
    );
}

PlaceImg.propTypes = {
    place: PropTypes.shape({
        photos: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
    index: PropTypes.number,
    className: PropTypes.string,
};

PlaceImg.defaultProps = {
    index: 0,
    className: 'object-cover',
};

