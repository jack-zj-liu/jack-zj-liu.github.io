import React from 'react'
import "./Profile.css";

function Profile() {
  return (
    <div>
        <div class="row">
            <div class="column">
                <div class="card">
                    <div> &nbsp;</div>
                    <img class='profile-picture' src="../images/me.jpg"/>
                    <div class="container">
                        <h2>Jack Liu</h2>
                        <p class="title">Software Engineering @ UWaterloo</p>
                        <p>Hi! I'm a 3rd year software engineering student at the university of waterloo. </p>
                        <p> &nbsp; </p>
                        <p>Contact me at:  </p>
                        <p>jack.liuzijia@gmail.com</p>
                        <p>zj5liu@uwaterloo.ca</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Profile;