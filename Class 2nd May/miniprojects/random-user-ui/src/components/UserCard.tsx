export type User = {
  gender: string

  name: {
    title: string
    first: string
    last: string
  }

  location: {
    street: {
      number: number
      name: string
    }

    city: string
    state: string
    country: string
    postcode: string | number

    coordinates: {
      latitude: string
      longitude: string
    }

    timezone: {
      offset: string
      description: string
    }
  }

  email: string

  login: {
    uuid: string
    username: string
  }

  dob: {
    date: string
    age: number
  }

  registered: {
    date: string
    age: number
  }

  phone: string
  cell: string

  id: number

  picture: {
    large: string
    medium: string
    thumbnail: string
  }

  nat: string
}


type UserCardProps = {
  user: User
}


function getCountryFlag(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) {
    return '🌍'
  }

  return countryCode
    .toUpperCase()
    .split('')
    .map(
      (char) =>
        String.fromCodePoint(
          127397 + char.charCodeAt(0)
        )
    )
    .join('')
}


function UserCard({ user }: UserCardProps) {

  const fullName =
    `${user.name.title} ${user.name.first} ${user.name.last}`


  const formattedBirthDate =
    new Date(user.dob.date).toLocaleDateString(
      'en-US',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    )


  const formattedRegisteredDate =
    new Date(
      user.registered.date
    ).toLocaleDateString(
      'en-US',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    )


  const flag = getCountryFlag(user.nat)


  const mapUrl =
    `https://www.openstreetmap.org/?mlat=${user.location.coordinates.latitude}&mlon=${user.location.coordinates.longitude}#map=12/${user.location.coordinates.latitude}/${user.location.coordinates.longitude}`


  return (
    <article className="user-card">

      {/* Orange accent */}
      <div className="card-accent"></div>


      {/* Profile */}
      <div className="profile-section">

        <div className="avatar-wrapper">

          <img
            src={user.picture.large}
            alt={fullName}
            className="user-avatar"
          />

        </div>


        <div className="profile-info">

          <div className="profile-name-row">

            <h3>
              {user.name.first} {user.name.last}
            </h3>

            <span className="gender-badge">
              {user.gender === 'male'
                ? '♂'
                : '♀'}
            </span>

          </div>


          <p className="user-title">
            {user.name.title}
            {' · '}
            @{user.login.username}
          </p>


          <div className="country-tag">

            <span>
              {flag}
            </span>

            {user.location.country}

            <span className="country-code">
              {user.nat}
            </span>

          </div>

        </div>

      </div>


      {/* Contact */}
      <div className="card-section">

        <div className="section-heading">

          <span className="section-icon">
            ✉
          </span>

          Contact

        </div>


        <div className="info-list">

          <a
            href={`mailto:${user.email}`}
            className="info-row"
          >

            <span className="info-icon">
              ✉
            </span>

            <div>

              <small>
                Email
              </small>

              <strong>
                {user.email}
              </strong>

            </div>

          </a>


          <a
            href={`tel:${user.phone}`}
            className="info-row"
          >

            <span className="info-icon">
              ☎
            </span>

            <div>

              <small>
                Phone
              </small>

              <strong>
                {user.phone}
              </strong>

            </div>

          </a>


          <a
            href={`tel:${user.cell}`}
            className="info-row"
          >

            <span className="info-icon">
              📱
            </span>

            <div>

              <small>
                Mobile
              </small>

              <strong>
                {user.cell}
              </strong>

            </div>

          </a>

        </div>

      </div>


      {/* Location */}
      <div className="card-section">

        <div className="section-heading">

          <span className="section-icon">
            ⌖
          </span>

          Location

        </div>


        <div className="location-box">

          <div className="location-main">

            <strong>
              {user.location.city}
            </strong>

            <span>
              {user.location.state},{' '}
              {user.location.country}
            </span>

          </div>


          <div className="address">

            {user.location.street.number}{' '}
            {user.location.street.name}

            <br />

            <span>
              Postal Code:{' '}
              {user.location.postcode}
            </span>

          </div>


          {/* Coordinates */}
          <div className="coordinates">

            <div>

              <span>
                LATITUDE
              </span>

              <strong>
                {user.location.coordinates.latitude}°
              </strong>

            </div>


            <div className="coordinate-divider"></div>


            <div>

              <span>
                LONGITUDE
              </span>

              <strong>
                {user.location.coordinates.longitude}°
              </strong>

            </div>


            <a
              href={mapUrl}
              target="_blank"
              rel="noreferrer"
              className="map-button"
            >
              ↗ Map
            </a>

          </div>

        </div>

      </div>


      {/* Personal information */}
      <div className="card-section">

        <div className="section-heading">

          <span className="section-icon">
            ◉
          </span>

          Personal

        </div>


        <div className="personal-grid">

          <div className="personal-item">

            <span>
              AGE
            </span>

            <strong>
              {user.dob.age} years
            </strong>

          </div>


          <div className="personal-item">

            <span>
              GENDER
            </span>

            <strong>
              {user.gender}
            </strong>

          </div>


          <div className="personal-item">

            <span>
              BIRTH DATE
            </span>

            <strong>
              {formattedBirthDate}
            </strong>

          </div>


          <div className="personal-item">

            <span>
              USER ID
            </span>

            <strong>
              #{user.id}
            </strong>

          </div>

        </div>

      </div>


      {/* Timezone */}
      <div className="timezone">

        <div className="timezone-icon">
          ◷
        </div>


        <div>

          <span>
            TIMEZONE
          </span>

          <strong>
            {user.location.timezone.offset}
          </strong>

          <p>
            {user.location.timezone.description}
          </p>

        </div>

      </div>


      {/* Account information */}
      <div className="account-footer">

        <div>

          <span>
            MEMBER SINCE
          </span>

          <strong>
            {formattedRegisteredDate}
          </strong>

        </div>


        <div className="uuid">

          <span>
            PROFILE ID
          </span>

          <strong>
            {user.login.uuid.slice(0, 8)}...
          </strong>

        </div>

      </div>

    </article>
  )
}


export default UserCard