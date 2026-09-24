#pragma once

#include <cstdint>
#include <random>
#include <string_view>

using CustomMte8 = std::mersenne_twister_engine<std::uint32_t, 8, 4, 2, 3, 0xb8u, 2, 0xffu, 3, 0xe0u, 2, 0x30u, 1, 5>;

/*
 * Add engines here
 */
#define RANDOM_REFERENCE_ENGINES(X) \
  X(minstd_rand0, std::minstd_rand0) \
  X(minstd_rand,   std::minstd_rand) \
  X(mt19937,       std::mt19937) \
  X(mt19937_64,    std::mt19937_64) \
  X(custom_mte8,   CustomMte8)

template <typename Fn>
bool with_engine(std::string_view name, Fn&& fn) {
#define TRY_ENGINE(name_, type_) \
  if (name == #name_) { \
    fn.template operator()<type_>(); \
    return true; \
  }

  RANDOM_REFERENCE_ENGINES(TRY_ENGINE)

#undef TRY_ENGINE

  return false;
}
