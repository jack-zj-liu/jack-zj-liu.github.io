import Image from 'next/image';
import './Profile.css';

export default function Profile() {
  return (
    <div style={{ minHeight: '100vh', background: '#1f1f23', padding: '24px 0' }}>
      <div className="row">
        <div className="column">
          <div className="card">
            <div> &nbsp;</div>
            <Image
              className="profile-picture"
              src="/images/me.jpg"
              alt="Jack Liu"
              width={400}
              height={400}
            />
            <div className="container">
              <h2 style={{ color: '#e5e5e7' }}>Jack Liu</h2>
              <p className="title">Software Engineering @ UWaterloo</p>
              <p style={{ color: '#9ca3af' }}>Hi! I&apos;m a second year software engineering student at the university of waterloo.</p>
              <p> &nbsp; </p>
              <p style={{ color: '#9ca3af' }}>Contact me at:</p>
              <p style={{ color: '#7dd3fc' }}>jack.liuzijia@gmail.com</p>
              <p style={{ color: '#7dd3fc' }}>zj5liu@uwaterloo.ca</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
