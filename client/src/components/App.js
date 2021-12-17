/*************************************************************************
 * File: App.jsx.jsx
 * This is a file for the base component of the app.
 * @author Cody Mercadante
 ************************************************************************/
import React from "react";
import { useState, useEffect, useRef } from "react";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faWindowClose,
  faEdit,
  faCalendar,
  faSpinner,
  faSignInAlt,
  faBars,
  faTimes,
  faSearch,
  faSort,
  faTrash,
  faEye,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";
import NavBar from "./NavBar";
import ModeTabs from "./ModeTabs";
import LoginPage from "./LoginPage";
import FeedPage from "./FeedPage";
import RoundsPage from "./RoundsPage";
import CoursesPage from "./CoursesPage";
import BuddiesPage from "./BuddiesPage";
import SideMenu from "./SideMenu";
import AppMode from "./AppMode";
import * as API from "../API";

library.add(
  faWindowClose,
  faEdit,
  faCalendar,
  faSpinner,
  faSignInAlt,
  faBars,
  faTimes,
  faSearch,
  faSort,
  faTrash,
  faEye,
  faUserPlus,
  faGithub,
  faGoogle
);

/*************************************************************************
 * @function ModeTabs
 * @desc
 * Default exported function that returns renders html for the component.
 *************************************************************************/
export default function App() {
  const [mode, setMode] = useState(AppMode.LOGIN); // the current mode of the app
  const [modalOpen, setModalOpen] = useState(false); // the current status of whether or not a modal is open
  const [badgesOpen, setbadgesOpen] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(false); // shows the page to edit a user account
  const [userData, setUserData] = useState({
    // the data associated with the logged in account
    accountData: {},
    identityData: {},
    speedgolfData: {},
    rounds: [],
    roundCount: 0,
  });
  const [authenticated, setAuthenticated] = useState(false); // the authentication status of the current user

  const [menuOpen, setMenuOpen] = React.useState(false); // the current status of whether or not the side menu is open
  const menuOpenRef = React.useRef(menuOpen); // reference for whether or not the side menu is open, needed for the click handler

  const [roundAdded, setRoundAdded] = useState(false);

  /*************************************************************************
   * @function useEffect
   * @desc
   * Upon rendering component, fetches user data if a user is authenticated.
   * Adds an event listener to handle clicks
   * @API getUserData - (re)-test authentication and obtain user data
   *************************************************************************/
  useEffect(() => {
    if (!authenticated) {
      API.getUserData(logInUser);
    }

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  /*
   handleClick -- document-level click handler assigned in componentDidMount()
   using 'true' as third param to addEventListener(). This means that the event
   handler fires in the _capturing_ phase, not the default _bubbling_ phase.
   Thus, the event handler is fired _before_ any events reach their lowest-level
   target. If the menu is open, we want to close
   it if the user clicks anywhere _except_ on a menu item, in which case we
   want the menu item event handler to get the event (through _bubbling_).
   We identify this border case by comparing 
   e.target.getAttribute("role") to "menuitem". If that's NOT true, then
   we close the menu and stop propagation so event does not reach anyone
   else. However, if the target is a menu item, then we do not execute 
   the if body and the event bubbles to the target. 
  */
  const handleClick = (e) => {
    if (menuOpenRef.current && e.target.getAttribute("role") !== "menuitem") {
      toggleMenuOpen();
      e.stopPropagation();
    }
  };

  /*************************************************************************
   MENU ITEM FUNCTIONALITY
   *************************************************************************/
  const logOut = () => {
    localStorage.clear();
    setMode(AppMode.LOGIN);
    setUserData({
      accountData: {},
      identityData: {},
      speedgolfData: {},
      speedgolfData: {},
      rounds: [],
    });
    setAuthenticated(false);
    setMenuOpen(false);
  };

  const showHideBadges = () => {
    toggleBadgesOpen();
  };

  /*************************************************************************
   USER INTERFACE STATE MANAGEMENT METHODS
   *************************************************************************/
  const toggleMenuOpen = () => {
    menuOpenRef.current = !menuOpenRef.current;
    setMenuOpen(menuOpenRef.current);
  };

  const toggleModalOpen = () => {
    setModalOpen(!modalOpen);
  };

  const toggleBadgesOpen = () => {
    setbadgesOpen(!badgesOpen);    
    if (badgesOpen){
      setMode(AppMode.BADGES);      
    }
    else{
      setMode(AppMode.FEED);
    }
  };

  /*************************************************************************
   ACCOUNT MANAGEMENT METHODS
   *************************************************************************/

  /*************************************************************************
   * @function accountExists
   * @desc
   * Upon rendering component, fetches user data if a user is authenticated.
   * Adds an event listener to handle clicks
   * @param {string} email - the email the user is trying to create an
   *                         account with
   * @API accountExists - checks whether an account already exists with a
   *                      given email
   * @return true if account exists, else false
   *************************************************************************/
  const accountExists = async (email) => {
    return await API.accountExists(email);
  };

  /*************************************************************************
   * @function getAccountData
   * @desc
   * Gets account data from local storage associated with a given email.
   * @param {string} email - the email of the user account
   * @return an object containing user data
   *************************************************************************/
  const getAccountData = (email) => {
    return JSON.parse(localStorage.getItem(email));
  };

  const authenticateUser = async (id, pw) => {
    const url = "/auth/login?username=" + id + "&password=" + pw;
    const res = await fetch(url, { method: "POST" });
    if (res.status == 200) {
      //successful login!
      return true;
    } else {
      //Unsuccessful login
      return false;
    }
  };

  /*************************************************************************
   * @function logInUser
   * @desc
   * Puts user data into local storage.
   * Sets userData state.
   * Sets app mode to FEED.
   * Sets authenticated state to true.
   * @param userObj - an object containing user data
   *************************************************************************/
  const logInUser = (userObj) => {
    localStorage.setItem(userObj.accountData.id, JSON.stringify(userObj));
    setUserData(userObj);
    setMode(AppMode.FEED);
    setAuthenticated(true);
  };

  // create a new user account
  const createAccount = async (data) => {
    // console.log(data);
    const url = "/users/" + data.accountData.id;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.status == 201) {
      return "New account created with email " + data.accountData.id;
    } else {
      const resText = await res.text();
      return "New account was not created. " + resText;
    }
  };

  // shows page to edit account data unless authenticated by 3rd party
  const doShowEditAccount = () => {
    let data = JSON.parse(localStorage.getItem(userData.accountData.id));
    if (data.accountData.hasOwnProperty("password")) {
      setShowEditAccount(!showEditAccount);
    } else {
      alert("Account by third party. Nothing to edit!");
    }
  };

  // updates data associated with account account
  const updateUserData = async (data) => {
    let storageData = localStorage.getItem(userData.accountData.id);
    storageData = JSON.parse(storageData);
    const url = "/users/" + storageData.accountData.id;

    //if the password is empty -> meaning no updating on the password
    //hence, refill the password field with the password from the localData
    if (data["accountData"]["password"].length === 0) {
      data["accountData"]["password"] = storageData["accountData"]["password"];
    }
    //updating localStorage data from the form
    for (let prop in data) {
      for (let subProp in data[prop]) {
        storageData[prop][subProp] = data[prop][subProp];
      }
    }

    let res = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    setShowEditAccount(!showEditAccount);
    setUserData(storageData);
    if (res.status === 200) {
      //in case of user updating their id
      localStorage.clear();
      localStorage.setItem(data.accountData.id, JSON.stringify(storageData));
      return "User Data Updated.";
    } else {
      const resText = await res.text();
      return "User Data Could not be updated. " + resText;
    }
  };

  /*************************************************************************
   ROUND MANAGEMENT METHODS
   *************************************************************************/
  // adds a new speedgolf round for a user
  const addRound = async (newRoundData) => {
    const url = "/rounds/" + userData.accountData.id;
    let res1 = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newRoundData),
    });

    const url2 = "/users/" + userData.accountData.id;
    let res2 = await fetch(url2, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({roundsLogged:userData.roundsLogged+1}),
    });

    if (res1.status == 201 && res2.status == 200) {
      //newRoundData doesnt contain information on ID.
      //Therefore, fetch data from db to contains information on the RoundID
      let roundInfo = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          return data;
        });
      roundInfo = JSON.parse(roundInfo);
      const newUserData = {
        accountData: userData.accountData,
        identityData: userData.identityData,
        speedgolfData: userData.speedgolfData,
        rounds: roundInfo,
        roundsLogged: userData.roundsLogged+1,
      };
      localStorage.setItem(
        newUserData.accountData.email
          ? newUserData.accountData.email
          : newUserData.accountData.id,
        JSON.stringify(newUserData)
      );
      //setState({userData: newUserData});
      setUserData(newUserData);
      setRoundAdded(true);
      return "New round logged.";
    } else {
      const resText = await res1.text();
      return "New Round could not be logged. " + resText;
    }
  };

  // updates the data associated with a speedgolf round
  const updateRound = async (newRoundData) => {
    const url = "/rounds/" + newRoundData.id;
    let temp = JSON.parse(JSON.stringify(newRoundData));
    delete temp.id;
    delete temp._id;
    delete temp.SGS;
    let res = await fetch(url, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(temp),
    });
    if (res.status === 200) {
      const newRounds = [...userData.rounds];
      let r;
      for (r = 0; r < newRounds.length; ++r) {
        if (newRounds[r].id === newRoundData.id) {
          break;
        }
      }
      newRounds[r] = newRoundData;
      const newUserData = {
        accountData: userData.accountData,
        identityData: userData.identityData,
        speedgolfData: userData.speedgolfData,
        rounds: newRounds,
        roundsLogged: userData.roundsLogged,
      };
      localStorage.setItem(
        newUserData.accountData.id,
        JSON.stringify(newUserData)
      );
      //setState({userData: newUserData});
      setUserData(newUserData);
      return "Round " + r + " updated.";
    } else {
      const resText = await res.text();
      return "No rounds was updated. " + resText;
    }
  };

  // // deletes a speedgolf round
  // const deleteRound = async (id) => {
  //   // delete from db
  //   const response = await API.deleteRound(id);
  //   console.log(response);
  //   //delete from local storage
  //   const newRounds = [...userData.rounds];
  //   let r;
  //   for (r = 0; r < newRounds.length; ++r) {
  //     if (newRounds[r]._id === id) {
  //       break;
  //     }
  //   }
  //   newRounds.splice(r, 1);
  //   const newUserData = {
  //     accountData: userData.accountData,
  //     identityData: userData.identityData,
  //     speedgolfData: userData.speedgolfData,
  //     rounds: newRounds,
  //     roundsLogged: userData.roundsLogged,
  //   };
  //   localStorage.setItem(
  //     newUserData.accountData.id,
  //     JSON.stringify(newUserData)
  //   );
  //   //setState({userData: newUserData});
  //   setUserData(newUserData);
  // };

  return (
    <>
        <>
          <NavBar
            mode={mode}
            menuOpen={menuOpen}
            toggleMenuOpen={toggleMenuOpen}
            modalOpen={modalOpen}
            toggleModalOpen={toggleModalOpen}
            userData={userData}
            updateUserData={updateUserData}
            showEditAccount={doShowEditAccount}
            rounds={userData.rounds}
          />
          <ModeTabs
            mode={mode}
            setMode={setMode}
            menuOpen={menuOpen}
            modalOpen={modalOpen}
          />

          {menuOpen ? <SideMenu logOut={logOut} 
                                showHideBadges={showHideBadges}
                      /> : null}
          {
            {
              LoginMode: 
                <LoginPage
                  modalOpen={modalOpen}
                  toggleModalOpen={toggleModalOpen}
                  logInUser={logInUser}
                  createAccount={createAccount}
                  accountExists={accountExists}
                  authenticateUser={authenticateUser}
                />
              ,
              FeedMode: 
                <FeedPage
                  modalOpen={modalOpen}
                  toggleModalOpen={toggleModalOpen}
                  menuOpen={menuOpen}
                />
              ,
              RoundsMode: 
                <RoundsPage
                  rounds={userData.rounds}
                  addRound={addRound}
                  updateRound={updateRound}
                  //deleteRound={deleteRound}
                  modalOpen={modalOpen}
                  toggleModalOpen={toggleModalOpen}
                  menuOpen={menuOpen}
                  roundAdded={roundAdded}
                />
              ,
              CoursesMode: 
                <CoursesPage
                  modalOpen={modalOpen}
                  toggleModalOpen={toggleModalOpen}
                  menuOpen={menuOpen}
                />
              ,
              BuddiesMode: 
                <BuddiesPage
                  modalOpen={modalOpen}
                  toggleModalOpen={toggleModalOpen}
                  menuOpen={menuOpen}
                />
              ,
            }[mode]
          }
        </>
      }
    </>
  );
}


//class based component of App.js
// import React from 'react';
// import { library } from "@fortawesome/fontawesome-svg-core"; 
// import { faWindowClose, faEdit, faCalendar, 
//         faSpinner, faSignInAlt, faBars, faTimes, faSearch,
//         faSort, faTrash, faEye, faUserPlus } from '@fortawesome/free-solid-svg-icons';
// import { faGithub, faGoogle} from '@fortawesome/free-brands-svg-icons';
// import NavBar from './NavBar.jsx';
// import ModeTabs from './ModeTabs';
// import LoginPage from './LoginPage.js';
// import FeedPage from './FeedPage.jsx'; //changed the file extension to JSX for functional component (same usage when calling component)
// import RoundsPage from './RoundsPage.jsx';
// // import CoursesPage from './CoursesPage.js';
// import BadgesPage from './BadgesPage'
// import BuddiesPage from './BuddiesPage.jsx'; //changed the file extension to JSX for functional component (same usage when calling component)
// import CoursesPage from './CoursesPage.jsx';
// // import BuddiesPage from './BuddiesPage.js';
// import SideMenu from './SideMenu.jsx';
// import AppMode from './AppMode.js';
// import * as API from '../API'
// import EditAccount from './EditAccount.js';

// library.add(faWindowClose,faEdit, faCalendar, 
//             faSpinner, faSignInAlt, faBars, faTimes, faSearch,
//             faSort, faTrash, faEye, faUserPlus, faGithub, faGoogle);

// class App extends React.Component {

//   constructor(props) {
//     super(props);
//     this.state = {mode: AppMode.LOGIN,
//                   menuOpen: false,
//                   modalOpen: false,
//                   badgesOpen: false,
//                   showEditAccount: false,
//                   userData: {
//                     accountData: {},
//                     identityData: {},
//                     speedgolfData: {},
//                     rounds: [],
//                     roundCount: 0},
//                   authenticated: false                  
//                   };
//   }

//   componentDidMount() {
//     document.addEventListener("click",this.handleClick, true);
//     if (!this.state.authenticated) { 
//       //Use /auth/test route to (re)-test authentication and obtain user data
//       fetch("/auth/test")
//         .then((response) => response.json())
//         .then((obj) => {
//           if (obj.isAuthenticated) {
//             this.logInUser(obj.user);
//           }
//         })
//     } 
//   }
  

//   /*
//    handleClick -- document-level click handler assigned in componentDidMount()
//    using 'true' as third param to addEventListener(). This means that the event
//    handler fires in the _capturing_ phase, not the default _bubbling_ phase.
//    Thus, the event handler is fired _before_ any events reach their lowest-level
//    target. If the menu is open, we want to close
//    it if the user clicks anywhere _except_ on a menu item, in which case we
//    want the menu item event handler to get the event (through _bubbling_).
//    We identify this border case by comparing 
//    e.target.getAttribute("role") to "menuitem". If that's NOT true, then
//    we close the menu and stop propagation so event does not reach anyone
//    else. However, if the target is a menu item, then we do not execute 
//    the if body and the event bubbles to the target. 
//   */
  
//   handleClick = (e) => {
//     if (this.state.menuOpen && e.target.getAttribute("role") !== "menuitem") {
//       this.toggleMenuOpen();
//       this.setState({badgesOpen: false});
//       e.stopPropagation();
//     }
//   }

//   /*
//    * Menu item functionality 
//    */
//   logOut = () => {
//     localStorage.clear();
//     this.setState({mode:AppMode.LOGIN,
//                    userData: {
//                     accountData: {},
//                     identityData: {},
//                     speedgolfData: {},
//                     rounds: [],
//                     },
//                    authenticated: false,
//                    menuOpen: false});
//   }

//   showHideBadges = () => {    
//     this.toggleBadgesOpen();
//   }
  
//    //User interface state management methods
   
//   setMode = (newMode) => {
//     this.setState({mode: newMode});
//   }

//   toggleMenuOpen = () => {
//     this.setState(prevState => ({menuOpen: !prevState.menuOpen}));
//   }

//   toggleBadgesOpen = () => {
//     this.setState(prevState => ({badgesOpen: !prevState.badgesOpen}));
//     if (this.state.badgesOpen){
//       this.setMode(AppMode.BADGES);      
//     }
//     else{
//       this.setMode(AppMode.FEED);
//     }
//   }

//   toggleModalOpen = () => {
//     this.setState(prevState => ({dialogOpen: !prevState.dialogOpen}));
//   }

//   //Account Management methods
   
//   accountExists = async(email) => {
//     const res = await fetch("/users/" + email);
//     return (res.status === 200);
//   }

//   getAccountData = (email) => {
//     console.log("TESTINGGGGG");
//     return JSON.parse(localStorage.getItem(email));
//   }

//   authenticateUser = async(id, pw) => {
//     const url = "/auth/login?username=" + id + 
//       "&password=" + pw;
//     const res = await fetch(url,{method: 'POST'});
//     if (res.status === 200) { //successful login!
//       return true;
//     } else { //Unsuccessful login
//       return false;
//     } 
//   }

//   logInUser = (userObj) => {
//     localStorage.setItem(userObj.accountData.id,JSON.stringify(userObj))
//     this.setState({userData: userObj,
//                     mode: AppMode.FEED,
//                     authenticated: true});
//   }

//   createAccount = async(data) => {
//     console.log(data)
//     const url = '/users/' + data.accountData.id;
//     const res = await fetch(url, {
//       headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//               },
//         method: 'POST',
//         body: JSON.stringify(data)}); 
//     if (res.status === 201) { 
//         return("New account created with email " + data.accountData.id);
//     } else { 
//         const resText = await res.text();
//         return("New account was not created. " + resText);
//     }
//   }

//   showEditAccount = () =>{
//     let data = JSON.parse(localStorage.getItem(this.state.userData.accountData.id))
//     if(data.accountData.hasOwnProperty('password')){
//       this.setState({showEditAccount: !this.state.showEditAccount});
//     }else{
//       alert("Account by third party. Nothing to edit!")
//     }
//   }

//   updateUserData = async (data) => {
//     let storageData = localStorage.getItem(this.state.userData.accountData.id)
//     // this.setState({userData: data});
//     storageData = JSON.parse(storageData)
//     const url = "/users/"+storageData.accountData.id;

//     //if the password is empty -> meaning no updating on the password
//     //hence, refill the password field with the password from the localData
//     if(data['accountData']['password'].length === 0){
//       data['accountData']['password'] = storageData['accountData']['password']
//     }
//     //updating localStorage data from the form
//     for(let prop in data){
//       for(let subProp in data[prop]){
//         storageData[prop][subProp] = data[prop][subProp]
//       }
//     }
    
//     let res = await fetch(url,{
//       method: 'PUT',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//             },
//       body: JSON.stringify(data)
//     });

//     this.setState({showEditAccount: !this.state.showEditAccount});
//     this.setState({userData: storageData});
//     if(res.status === 200){
//       //in case of user updating their id
//       localStorage.clear();
//       localStorage.setItem(data.accountData.id,JSON.stringify(storageData));
//       return("User Data Updated.");
//     }else{
//       const resText = await res.text();
//       return("User Data Could not be updated. " + resText);
//     }
//   }

//   //Round Management methods

//   addRound = async(newRoundData) => {
//     console.log(newRoundData)
//     const url = "/rounds/" + this.state.userData.accountData.id;
//     let res = await fetch(url, {
//                   method: 'POST',
//                   headers: {
//                             'Accept': 'application/json',
//                             'Content-Type': 'application/json'
//                                 },
//                   body: JSON.stringify(newRoundData)
//                 }); 
//     if (res.status === 201) { 
//       //newRoundData doesnt contain information on ID.
//       //Therefore, fetch data from db to contains information on the RoundID
//       let roundInfo = await fetch(url, {
//         method: 'GET',
//         headers: {
//                   'Accept': 'application/json',
//                   'Content-Type': 'application/json'
//                       }
//       })
//       .then((response) => response.json())
//       .then((data) => {
//         return data;
//       });
//       roundInfo = JSON.parse(roundInfo);
//       const newUserData = {accountData: this.state.userData.accountData,
//                            identityData: this.state.userData.identityData,
//                            speedgolfData: this.state.userData.speedgolfData,
//                            rounds: roundInfo};
//       localStorage.setItem(newUserData.accountData.email?newUserData.accountData.email:newUserData.accountData.id,JSON.stringify(newUserData));
//       this.setState({userData: newUserData});
//       return("New round logged.");
//     } else { 
//       const resText = await res.text();
//       return("New Round could not be logged. " + resText);
//     }
//   }

//   updateRound = async(newRoundData) => {
//     console.log(newRoundData)
//     const url = "/rounds/" + newRoundData.id;
//     let temp = JSON.parse(JSON.stringify(newRoundData));
//     delete temp.id;
//     delete temp._id;
//     delete temp.SGS;
//     let res = await fetch(url, {
//       method: 'PUT',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(temp)
//     }); 
//     if(res.status === 200){
//       const newRounds = [...this.state.userData.rounds];
//       let r;
//       for (r = 0; r < newRounds.length; ++r) {
//         if (newRounds[r].id === newRoundData.id) {
//           break;
//         }
//       }
//       newRounds[r] = newRoundData;
//       const newUserData = {
//         accountData: this.state.userData.accountData,
//         identityData: this.state.userData.identityData,
//         // speedgolfProfileData: this.state.userData.speedgolfProfileData,
//         rounds: newRounds, 
//         // roundCount: this.state.userData.roundCount
//       }
//       localStorage.setItem(newUserData.accountData.id,JSON.stringify(newUserData));
//       this.setState({userData: newUserData}); 
//       return("Round "+ r + " updated.");
//     }else{
//       const resText = await res.text();
//       return("No rounds was updated. " + resText);
//     }
//   }

//   deleteRound = async (id) => {
//     // delete from db
//     const response = await API.deleteRound(id);
//     console.log(response);
//     //delete from local storage
//     const newRounds = [...this.state.userData.rounds];
//     let r;
//     for (r = 0; r < newRounds.length; ++r) {
//         if (newRounds[r]._id === id) {
//             break;
//         }
//     }
//     newRounds.splice(r,1);
//     const newUserData = {
//       accountData: this.state.userData.accountData,
//       identityData: this.state.userData.identityData,
//       speedgolfProfileData: this.state.userData.speedgolfProfileData,
//       rounds: newRounds, 
//       roundCount: this.state.userData.roundCount
//     }
//     localStorage.setItem(newUserData.accountData.id,JSON.stringify(newUserData));
//     this.setState({userData: newUserData});
//   }

//   render() {
//     return (
//       <>
//         {this.state.showEditAccount ? 
//                       <EditAccount menuOpen={this.state.modalOpen}
//                       showEditAccount={this.showEditAccount}
//                       userData={this.state.userData}
//                       updateUserData={this.updateUserData}/> : 
//           <>            
//             <NavBar mode={this.state.mode}
//                     menuOpen={this.state.menuOpen}
//                     toggleMenuOpen={this.toggleMenuOpen}
//                     modalOpen={this.state.modalOpen}
//                     toggleModalOpen={this.toggleModalOpen}
//                     userData={this.state.userData}
//                     updateUserData={this.updateUserData} 
//                     showEditAccount={this.showEditAccount}/> 
//             <ModeTabs mode={this.state.mode}
//                       setMode={this.setMode} 
//                       menuOpen={this.state.menuOpen}
//                       modalOpen={this.state.modalOpen}/> 
            
//             {this.state.menuOpen  ? <SideMenu logOut={this.logOut}
//                                               showHideBadges={this.showHideBadges}
//                                     /> : null }            
//             {
//               {
//                 BadgesMode:
//                 <BadgesPage/>,
//                 LoginMode:
//                 <LoginPage modalOpen={this.state.modalOpen}
//                           toggleModalOpen={this.toggleModalOpen} 
//                           logInUser={this.logInUser}
//                           createAccount={this.createAccount}
//                           accountExists={this.accountExists}
//                           authenticateUser={this.authenticateUser}/>, 
//                 FeedMode:
//                   <FeedPage modalOpen={this.state.modalOpen}
//                             toggleModalOpen={this.toggleModalOpen} 
//                             menuOpen={this.state.menuOpen}
//                             userId={this.state.userId}/>,
//                 RoundsMode:
//                   <RoundsPage rounds={this.state.userData.rounds}
//                               addRound={this.addRound}
//                               updateRound={this.updateRound}
//                               deleteRound={this.deleteRound}
//                               modalOpen={this.state.modalOpen}
//                               toggleModalOpen={this.toggleModalOpen} 
//                               menuOpen={this.state.menuOpen}
//                               userId={this.state.userId}/>,
//                 CoursesMode:
//                   <CoursesPage modalOpen={this.state.modalOpen}
//                               toggleModalOpen={this.toggleModalOpen} 
//                               menuOpen={this.state.menuOpen}
//                               userId={this.state.userId}/>,
//                 BuddiesMode:
//                   <BuddiesPage modalOpen={this.state.modalOpen}
//                               toggleModalOpen={this.toggleModalOpen} 
//                               menuOpen={this.state.menuOpen}
//                               userId={this.state.userId}/>
//               }[this.state.mode]
//             }
//           </>
//         }
//       </>
//     ); 
//   }

// }
// export default App;

