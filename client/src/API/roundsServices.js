export const deleteRound = async (id) => {
  const url = "rounds/" + id;
  try{
    const res = await fetch(url, { method: "DELETE" });
    if (res.status == 200) {
        return ("round id=" + id + " deleted successfully")
    } else {
        return ("Error: round not deleted")
    }
  } catch (err) {
    console.log(err)
  }
};
