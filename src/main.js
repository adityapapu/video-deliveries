function checkIsMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
document.addEventListener("DOMContentLoaded", () => {
  const isMobile = checkIsMobile();
  const videoId = isMobile
    ? "gcc-36095433-96fa-4216-bfdf-93f1c2129536"
    : "gcc-296ad775-3336-4fbb-b956-013003617f9a";
  const config = {
    kvideoId: videoId,
    videoHost: "ccoe.kpoint.com",
    params: {
      resume: false,
      search: false,
      like: false,
      trk_tracking_id: "2024",
      playerSkinType: "sleek",
      "add-widgets": "emailgate",
    },
    externalWidgetsConfig: {
      emailgate: {
        id: "Emailgate",
        overlay_msg: "Please enter your email address.",
        offset: 57,
        button_text: "Submit",
        button_color: "#00AEFF",
        always_render: true,
      },
    },
  };
  const container = document.getElementById("smart-player");

  //for vertical video we need to set the aspect ratio(data-ar)
  if (isMobile) {
    container.setAttribute("data-ar", "9:16");
  }

  function createPlayer() {
    if (window.kPoint) {
      kPoint.Player(container, config);
    } else {
      setTimeout(createPlayer, 100);
    }
  }
  createPlayer();
});
