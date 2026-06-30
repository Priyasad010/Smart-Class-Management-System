const axios = require('axios');

class MoodleService {
  constructor() {
    this.moodleUrl = process.env.MOODLE_URL || 'http://localhost/moodle/webservice/rest/server.php';
    this.token = process.env.MOODLE_TOKEN || 'DUMMY_TOKEN_FOR_DEV';
  }

  async makeRequest(functionName, params = {}) {
    try {
      const urlParams = new URLSearchParams({
        wstoken: this.token,
        wsfunction: functionName,
        moodlewsrestformat: 'json',
        ...params
      });

      const response = await axios.post(this.moodleUrl, urlParams.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.exception) {
        throw new Error(`Moodle API Error: ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      console.error(`❌ Moodle API Request Failed (${functionName}):`, error.message);
      throw error;
    }
  }

  async createUser(student) {
    const params = {
      'users[0][username]': student.username,
      'users[0][password]': student.password,
      'users[0][firstname]': student.firstname,
      'users[0][lastname]': student.lastname,
      'users[0][email]': student.email || `${student.username}@thusitha.edu.lk`
    };

    return this.makeRequest('core_user_create_users', params);
  }

  async enrollUser(moodleUserId, moodleCourseId, roleId = 5) { // 5 is default student role in Moodle
    const params = {
      'enrolments[0][roleid]': roleId,
      'enrolments[0][userid]': moodleUserId,
      'enrolments[0][courseid]': moodleCourseId
    };

    return this.makeRequest('enrol_manual_enrol_users', params);
  }

  async getSSOToken(username) {
    // Requires a custom local plugin or auth_userkey plugin in Moodle
    const params = {
      'username': username
    };
    return this.makeRequest('auth_userkey_request_login_url', params);
  }
}

module.exports = new MoodleService();
