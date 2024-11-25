const sendToken = (res, user, message, statusCode = 200, type = undefined) => {
  // user.password = undefined;
  const token = user ? user.getJwtToken() : null;
  const CookieOptions = {
    expires: user
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      : new Date(Date.now()),
    domain: ".nazdikwala.com",
  };
  let name = type == undefined ? "nazdikwalaUser" : "nazdikwala";

  res
    .status(statusCode)
    .cookie(name, token, CookieOptions)
    .json({
      success: true,
      message,
      nazdikwala: token,
      ...(type == undefined ? { user } : { [type]: user }),
    });
};

module.exports = sendToken;
