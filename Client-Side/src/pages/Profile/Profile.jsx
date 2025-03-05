import React, { useEffect, useState } from "react";

import { motion } from "framer-motion";
import { BASE_URL } from "../../helpers/settings";

function Profile() {
  const [user, setUser] = useState(null);
  const [selectedPage, setSelectedPage] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [refetch, setRefetch] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const handleAnalytics = (e) => {
    e.preventDefault();
    setRefetch((re) => !re);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/v1/users/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUser(data.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/users/pageInsights`, {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },

          body: JSON.stringify({
            pageId: selectedPage?.id,
            since,
            until,
            access_token: selectedPage?.access_token,
          }),
        });

        const data = await res.json();
        console.log(data.data);

        setAnalytics(data.data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchAnalytics();
  }, [
    token,
    selectedPage?.id,
    selectedPage?.access_token,
    refetch,
    since,
    until,
  ]);

  if (loading)
    return (
      <section className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 py-24 px-6 md:px-12">
        <h1 className="text-4xl caret-blue-700">Loading...</h1>
      </section>
    );

  return (
    <section className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 py-24 px-6 md:px-12">
      <div className="bg-gray-800 shadow-2xl rounded-xl p-[50px] max-w-7xl w-full mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between p-6 bg-gray-700 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {user && (
            <div className="flex items-center gap-4">
              <img
                src={user?.photo}
                alt="Profile"
                className="w-16 h-16 rounded-full border-4 border-blue-500"
              />
              <h2 className="text-2xl font-semibold text-white">
                {user?.fullName}
              </h2>
            </div>
          )}
        </motion.div>

        {/* Page Selector */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <label className="block text-lg text-gray-300 mb-2 font-medium">
            Select a Page:
          </label>
          <select
            className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500 shadow-lg transition"
            onChange={(e) => {
              setSelectedPage(JSON.parse(e.target.value));
              // fetchAnalytics(e.target.value);
            }}
          >
            <option value="">-- Select a Page --</option>
            {user?.pages?.map((page) => (
              <option key={page.id} value={JSON.stringify(page)}>
                {page?.name}
              </option>
            ))}
          </select>
        </motion.div>

        {/* Date Filters */}
        <motion.div
          className="mt-6 flex gap-4 flex-wrap"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <input
            type="date"
            className="p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 shadow-lg"
            value={since}
            onChange={(e) => setSince(e.target.value)}
          />
          <input
            type="date"
            className="p-3 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 shadow-lg"
            value={until}
            onChange={(e) => setUntil(e.target.value)}
          />
          <button
            className="bg-blue-600 px-6 py-3 rounded-lg font-semibold text-white shadow-lg hover:bg-blue-700 transition cursor-pointer"
            onClick={handleAnalytics}
          >
            Apply Filters
          </button>
        </motion.div>

        {/* Analytics Cards */}
        {analytics && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Total Followers */}
            <motion.div
              className="p-6 bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-xl font-semibold text-gray-300">Followers</h3>
              <p className="text-4xl font-bold text-blue-400">
                {analytics?.totalFollowers}
              </p>
            </motion.div>

            {/* Total Engagement */}
            <motion.div
              className="p-6 bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-xl font-semibold text-gray-300">
                Engagement
              </h3>
              <p className="text-4xl font-bold text-green-400">
                {analytics?.totalEngagement}
              </p>
            </motion.div>

            {/* Total Impressions */}
            <motion.div
              className="p-6 bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-xl font-semibold text-gray-300">
                Impressions
              </h3>
              <p className="text-4xl font-bold text-yellow-400">
                {analytics?.totalPostImpressions}
              </p>
            </motion.div>

            {/* Total Reactions */}
            <motion.div
              className="p-6 bg-gray-700 rounded-lg shadow-lg hover:shadow-xl transition"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-xl font-semibold text-gray-300">
                Total Likes
              </h3>
              <p className="text-4xl font-bold text-red-400">
                {analytics?.totalPostReactions}
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default Profile;
