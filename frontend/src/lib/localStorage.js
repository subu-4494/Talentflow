export const saveResponse = (jobId, candidateId, responses) => {
  const key = `responses_${jobId}_${candidateId}`;
  localStorage.setItem(key, JSON.stringify(responses));
};

export const getResponse = (jobId, candidateId) => {
  const key = `responses_${jobId}_${candidateId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : {};
};
