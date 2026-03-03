import Image from 'next/image';
import './Profile.css';

export default function Profile() {
  return (
    <div>
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
              <h2>Jack Liu</h2>
              <p className="title">Software Engineering @ UWaterloo</p>
              <p>Hi! I&apos;m a second year software engineering student at the university of waterloo.</p>
              <p> &nbsp; </p>
              <p>Contact me at:</p>
              <p>jack.liuzijia@gmail.com</p>
              <p>zj5liu@uwaterloo.ca</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
