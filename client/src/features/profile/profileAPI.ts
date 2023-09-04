import {fetchWrapper} from "../../api/FetchWrapper";

export function fetchAllProfiles() {
  return fetchWrapper.get('api/v1/profiles.json')
}