function jsonResponse(body, status = 200) {
  return {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  };
}

export function createExamsRoutes({ sessionService }) {
  return async function handleExamsRoute(request) {
    if (request.method === 'GET' && request.pathname === '/api/exams') {
      const items = await sessionService.listExamSets();
      return jsonResponse({ items });
    }

    return null;
  };
}
