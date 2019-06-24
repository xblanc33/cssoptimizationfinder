dat <- read.csv("result.csv", header = FALSE)
plot(dat$V2,dat$V5)
cor.test(dat$V2,dat$V5,method = "spearman")
