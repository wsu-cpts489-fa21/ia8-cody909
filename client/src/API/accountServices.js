export const getUserData = async (loginUser) => {
  const url = "/auth/test";
  try {
    fetch(url)
      .then((response) => response.json())
      .then((obj) => {
        if (obj.isAuthenticated) {
          loginUser(obj.user);
        }
      });
  } catch (err) {
    console.log(err);
  }
};

export const accountExists = async (email) => {
  try {
    const res = await fetch("/users/");
    return res.status === 200;
  } catch (err) {
    console.log(err);
  }
};
