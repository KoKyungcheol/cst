import React, { useEffect, useRef, useState } from "react";
import { useHistory } from 'react-router-dom';
import { useUserStore } from "../../../store/userStore";
import Bookmark from './Bookmark';
import Permissions from "./Permissions";

function Profile(props) {
  const [username] = useUserStore(state => [state.username])
  const history = useHistory();
  const permissionsRef = useRef();
  const bookmarkRef = useRef();
  const tab3 = useRef();
  const tab4 = useRef();
  const [active, setActive] = useState('');
  const [userInfo, setUserInfo] = useState({
    username: '',
    displayName: '',
    email: '',
    phone: '',
    uniqueValue: '',
    department: '',
    businessValue: '',
    etc: ''
  });
  const [userPasswordInfo, setUserPasswordInfo] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  useEffect(() => {
    tab3.current.addEventListener('shown.bs.tab', function (e) {
      setActive('bookmark');
    });
    tab4.current.addEventListener('shown.bs.tab', function (e) {
      setActive('permission');
    });

    loadData();
  }, []);
  const loadData = () => {
    axios.get(baseURI() + 'system/users/' + username)
      .then(function (res) {
        if (res.status === gHttpStatus.SUCCESS) {
          setUserInfo(res.data);
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  }
  const updateUserInfo = (e) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value
    });
  }
  const updateUserPassword = (e) => {
    setUserPasswordInfo({
      ...userPasswordInfo,
      [e.target.name]: e.target.value
    });
  }
  const saveUserInfo = () => {
    showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SAVE'), function (answer) {
      if (answer) {
        axios({
          method: 'post',
          headers: { 'content-type': 'application/json' },
          url: baseURI() + 'system/users/' + username,
          data: userInfo
        })
          .then(function (response) {
            if (response.status === gHttpStatus.SUCCESS) {
              showMessage(transLangKey('MSG_CONFIRM'), response.data.message, { close: false }, function (answer) {
                if (answer) {
                  history.go(0);
                }
              });
            }
          })
          .catch(function (err) {
            console.log(err);
          });
      }
    });
  }
  const saveUserPassword = () => {
    showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_SAVE'), function (answer) {
      if (answer) {
        let saveInfo = Object.assign(userPasswordInfo, { username: userInfo.username })

        axios({
          method: 'post',
          headers: { 'content-type': 'application/json', 'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') },
          url: baseURI() + 'system/users/' + username + "/password",
          data: saveInfo
        })
          .then(function (response) {
            if (response.status === gHttpStatus.SUCCESS) {
              showMessage(transLangKey('MSG_CONFIRM'), response.data.message, function (answer) {
                if (answer) {
                  setUserPasswordInfo({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  return;
                }
              })
            }
          })
          .catch(function (err) {
            showMessage(transLangKey('MSG_ERROR'), err.response.data.message, function (answer) {
              if (answer) {
                return;
              }
            });
          });
      }
    });
  }
  let openTab = () => {
    let elnode;
    if (active === 'bookmark') {
      elnode = <Bookmark id="bookmark" ref={bookmarkRef}></Bookmark>
    }
    else if (active === 'permission') {
      elnode = <Permissions id="permission" ref={permissionsRef}></Permissions>
    }
    return elnode;
  }
  return (
    <>
      <div className="row">
        <div className="col-md-3 col-xl-2">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0 font-weight-bold">{transLangKey('ACCOUNT_MANAGEMENT')}</h5>
            </div>
            <div className="list-group list-group-flush" role="tablist">
              <a className="list-group-item list-group-item-action active" data-bs-toggle="list" href="#account" role="tab">
                {transLangKey('COMM')}
              </a>
              <a className="list-group-item list-group-item-action" data-bs-toggle="list" href="#password" role="tab">
                {transLangKey('PASSWORD')}
              </a>
              <a className="list-group-item list-group-item-action" data-bs-toggle="list" href="#bookmark" role="tab" ref={tab3}>
                {transLangKey('BOOKMARK')}
              </a>
              <a className="list-group-item list-group-item-action" data-bs-toggle="list" href="#permission" role="tab" ref={tab4}>
                {transLangKey('MY_PERMISSION')}
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-9 col-xl-10">
          <div className="tab-content">
            <div className="tab-pane fade show active" id="account" role="tabpanel">
              <div className="card">
                <div className="card-body">
                  <form>
                    <div className="row">
                      <div className="col-md-8">
                        <div className="mb-3">
                          <label className="form-label" htmlFor="inputUsername">{transLangKey('USER_ID')}</label>
                          <input type="text" className="form-control" readOnly name="username" value={userInfo.username || ''} onChange={updateUserInfo} />
                        </div>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="inputUniqueValue">{transLangKey('UNIQUE_VALUE')}</label>
                          <input type="text" className="form-control" name="uniqueValue" value={userInfo.uniqueValue || ''} onChange={updateUserInfo} />
                        </div>
                        <div className="row">
                          <div className="mb-3 col-md-6">
                            <label className="form-label" htmlFor="inputDepartment">{transLangKey('DEPARTMENT')}</label>
                            <input type="text" className="form-control" name="department" value={userInfo.department || ''} onChange={updateUserInfo} />
                          </div>
                          <div className="mb-3 col-md-6">
                            <label className="form-label" htmlFor="inputBusinessValue">{transLangKey('BUSINESS')}</label>
                            <input type="text" className="form-control" name="businessValue" value={userInfo.businessValue || ''} onChange={updateUserInfo} />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4 d-flex align-items-center justify-content-center">
                        <div className="mb-3">
                          <img src={baseURI() + "images/common/user.png"} style={{ width: "180px" }} ></img>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                </div>
                <div className="card-body">
                  {
                    active === 'home' ? openTab() : null
                  }
                  <form>
                    <div className="mb-3 col-md-8">
                      <label className="form-label" htmlFor="inputDisplayName">{transLangKey('USER_NAME')}</label>
                      <input type="text" className="form-control" name="displayName" value={userInfo.displayName || ''} onChange={updateUserInfo} />
                    </div>
                    <div className="mb-3 col-md-8">
                      <label className="form-label" htmlFor="inputEmail4">{transLangKey('EMAIL')}</label>
                      <input type="email" className="form-control" name="email" value={userInfo.email || ''} onChange={updateUserInfo} />
                    </div>
                    <div className="mb-3 col-md-8">
                      <label className="form-label" htmlFor="inputAddress">{transLangKey('PHONE')}</label>
                      <input type="text" className="form-control" name="phone" value={userInfo.phone || ''} onChange={updateUserInfo} />
                    </div>
                    <div className="mb-3 col-md-8">
                      <label className="form-label" htmlFor="inputAddress">{transLangKey('ETC')}</label>
                      <input type="text" className="form-control" name="etc" value={userInfo.etc || ''} onChange={updateUserInfo} />
                    </div>
                    <button type="button" className="btn btn-primary" onClick={saveUserInfo} >{transLangKey('SAVE')}</button>
                  </form>
                </div>
              </div>
            </div>
            <div className="tab-pane fade" id="password" role="tabpanel">
              <div className="card">
                <div className="card-body">
                  {
                    active === 'password' ? openTab() : null
                  }
                  <form>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="inputPasswordCurrent">{transLangKey('USER_PW_NOW')}</label>
                      <input type="password" className="form-control" name="oldPassword" value={userPasswordInfo.oldPassword} onChange={updateUserPassword} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="inputPasswordNew">{transLangKey('USER_PW_INPUT')}</label>
                      <input type="password" className="form-control" name="newPassword" value={userPasswordInfo.newPassword} onChange={updateUserPassword} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor="inputPasswordNew2">{transLangKey('USER_PW_INPUT_RE')}</label>
                      <input type="password" className="form-control" name="confirmPassword" value={userPasswordInfo.confirmPassword} onChange={updateUserPassword} />
                    </div>
                    <button type="button" className="btn btn-primary" onClick={saveUserPassword} >{transLangKey('SAVE')}</button>
                  </form>
                </div>
              </div>
            </div>
            <div className="tab-pane fade" id="bookmark" role="tabpanel">
              <div className="card">
                <div className="card-body">
                  {
                    active === 'bookmark' ? openTab() : null
                  }
                </div>
              </div>
            </div>
            <div className="tab-pane fade" id="permission" role="tabpanel">
              <div className="card">
                <div className="card-body">
                  {
                    active === 'permission' ? openTab() : null
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Profile;