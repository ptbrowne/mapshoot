export default {
  parseStyleURL: mapboxStyleURL => {
    const mapboxLogin = mapboxStyleURL && mapboxStyleURL.split("/")[3]
    const mapboxStyleId = mapboxStyleURL && mapboxStyleURL.split("/")[4]
    return { mapboxLogin, mapboxStyleId }
  }
}
