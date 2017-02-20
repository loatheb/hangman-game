exports.handleResponse = (res) => {
    if (!res.data) {
        throw new Error(res, 'Return Error');
    }
    return res.data;
};
